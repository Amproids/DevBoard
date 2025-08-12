const createError = require('http-errors');
const Tasks = require('../models').tasks;
const Columns = require('../models').columns;
const Users = require('../models').users;
const Comments = require('../models').comments;
const Attachments = require('../models').attachments;
const mongoose = require('mongoose');

const createTaskService = async (columnId, taskData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const column = await Columns.findById(columnId)
            .populate('board', 'owner members')
            .session(session);

        if (!column) throw createError(404, 'Column not found');

        const hasAccess =
            column.board.owner.equals(userId) ||
            column.board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(
                403,
                'No permission to create tasks in this column'
            );
        }

        if (taskData.assignees?.length > 0) {
            const validUsers = await Users.countDocuments({
                _id: { $in: taskData.assignees },
                $or: [
                    { _id: column.board.owner },
                    { _id: { $in: column.board.members.map(m => m.user) } }
                ]
            }).session(session);

            if (validUsers !== taskData.assignees.length) {
                throw createError(400, 'Some assignees are not board members');
            }
        }

        const newTask = new Tasks({
            ...taskData,
            column: columnId,
            board: column.board._id,
            createdBy: userId
        });

        const savedTask = await newTask.save({ session });

        column.tasks.push(savedTask._id);
        await column.save({ session });

        await session.commitTransaction();
        return savedTask;
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in createTaskService:', err.message);

        if (err.name === 'ValidationError') {
            throw createError(400, `Invalid task data: ${err.message}`);
        } else if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const getTaskDetailsService = async (taskId, userId) => {
    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'name board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .populate({
                path: 'assignees',
                select: 'firstName lastName email avatar'
            })
            .populate({
                path: 'createdBy',
                select: 'firstName lastName'
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'firstName lastName avatar'
                }
            });

        if (!task) {
            throw createError(404, 'Task not found');
        }

        const board = task.column.board;
        const hasAccess =
            board.owner.equals(userId) ||
            board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(403, 'No permission to view this task');
        }

        const taskData = task.toObject();

        taskData.boardId = board._id;
        taskData.boardName = board.name;
        taskData.columnName = task.column.name;

        return taskData;
    } catch (err) {
        console.error('Error in getTaskDetailsService:', err.message);
        throw err;
    }
};

const updateTaskService = async (taskId, updateData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) throw createError(404, 'Task not found');

        const board = task.column.board;

        const isOwnerOrAdmin =
            board.owner.equals(userId) ||
            board.members.some(
                m => m.user.equals(userId) && m.role === 'admin'
            );

        if (!isOwnerOrAdmin) {
            throw createError(403, 'No permission to update this task');
        }

        if (updateData.assignees) {
            const validUsers = await Users.countDocuments({
                _id: { $in: updateData.assignees },
                $or: [
                    { _id: board.owner },
                    { _id: { $in: board.members.map(m => m.user) } }
                ]
            }).session(session);

            if (validUsers !== updateData.assignees.length) {
                throw createError(400, 'Some assignees are not board members');
            }
        }

        if (updateData.column) {
            const newColumn = await Columns.findOne({
                _id: updateData.column,
                board: board._id
            }).session(session);

            if (!newColumn) {
                throw createError(400, 'New column not found in this board');
            }

            await Columns.updateOne(
                { _id: task.column._id },
                { $pull: { tasks: taskId } }
            ).session(session);

            const newOrder =
                updateData.order !== undefined
                    ? updateData.order
                    : newColumn.tasks.length;

            await Columns.updateOne(
                { _id: updateData.column },
                { $push: { tasks: { $each: [taskId], $position: newOrder } } }
            ).session(session);

            task.column = updateData.column;
        }

        Object.keys(updateData).forEach(key => {
            if (!['column', 'order'].includes(key)) {
                task[key] = updateData[key];
            }
        });

        await task.save({ session });
        await session.commitTransaction();

        const updatedTask = await Tasks.findById(taskId)
            .populate('assignees', 'firstName lastName avatar')
            .populate('createdBy', 'firstName lastName');

        return updatedTask;
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in updateTaskService:', err.message);

        if (err.name === 'ValidationError') {
            throw createError(400, `Invalid task data: ${err.message}`);
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const deleteTaskService = async (taskId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) {
            throw createError(404, 'Task not found');
        }

        const board = task.column.board;

        const isOwnerOrAdmin =
            board.owner.equals(userId) ||
            board.members.some(
                m => m.user.equals(userId) && m.role === 'admin'
            );

        if (!isOwnerOrAdmin) {
            throw createError(403, 'No permission to delete this task');
        }

        await Columns.updateOne(
            { _id: task.column._id },
            { $pull: { tasks: taskId } }
        ).session(session);

        await Tasks.deleteOne({ _id: taskId }).session(session);

        await Comments.deleteMany({ task: taskId }).session(session);
        await Attachments.deleteMany({ task: taskId }).session(session);

        await session.commitTransaction();

        return {
            taskId: taskId,
            boardId: board._id,
            deletedComments: await Comments.countDocuments({ task: taskId }),
            deletedAttachments: await Attachments.countDocuments({
                task: taskId
            })
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in deleteTaskService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid task ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const moveTaskService = async (taskId, moveData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log('=== MOVE TASK SERVICE START ===');
        console.log('TaskId:', taskId);
        console.log('Target Column:', moveData.targetColumnId);
        console.log('New Order:', moveData.newOrder);

        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) throw createError(404, 'Task not found');

        console.log('Current Column:', task.column._id);
        console.log(
            'Is same column?',
            task.column.equals(moveData.targetColumnId)
        );

        const currentBoard = task.column.board;
        const hasCurrentAccess =
            currentBoard.owner.equals(userId) ||
            currentBoard.members.some(m => m.user.equals(userId));

        if (!hasCurrentAccess) {
            throw createError(403, 'No permission to move this task');
        }

        const targetColumn = await Columns.findOne({
            _id: moveData.targetColumnId,
            board: currentBoard._id
        }).session(session);

        if (!targetColumn) {
            throw createError(400, 'Target column not found in this board');
        }

        const isMovingWithinSameColumn = task.column.equals(
            moveData.targetColumnId
        );
        const maxOrder = isMovingWithinSameColumn
            ? targetColumn.tasks.length - 1
            : targetColumn.tasks.length;

        if (moveData.newOrder < 0 || moveData.newOrder > maxOrder) {
            throw createError(400, `Order must be between 0 and ${maxOrder}`);
        }

        await Columns.updateOne(
            { _id: task.column._id },
            { $pull: { tasks: taskId } }
        ).session(session);

        console.log('Removed task from column:', task.column._id);

        const targetCol = await Columns.findById(
            moveData.targetColumnId
        ).session(session);

        console.log('Target column tasks before insert:', targetCol.tasks);

        const tasksArray = [...targetCol.tasks];
        tasksArray.splice(moveData.newOrder, 0, taskId);

        console.log('Target column tasks after insert:', tasksArray);

        await Columns.updateOne(
            { _id: moveData.targetColumnId },
            { $set: { tasks: tasksArray } }
        ).session(session);

        task.column = moveData.targetColumnId;
        await task.save({ session });

        await session.commitTransaction();

        console.log('=== MOVE COMPLETE ===');

        return {
            taskId: task._id,
            previousColumnId: task.column._id,
            newColumnId: moveData.targetColumnId,
            newOrder: moveData.newOrder
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in moveTaskService:', err.message);
        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const assignTaskService = async (taskId, userIdToAssign, currentUserId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) throw createError(404, 'Task not found');

        const board = task.column.board;

        const hasAccess =
            board.owner.equals(currentUserId) ||
            board.members.some(m => m.user.equals(currentUserId));

        if (!hasAccess) {
            throw createError(
                403,
                'No permission to assign tasks in this board'
            );
        }

        const isMember =
            board.owner.equals(userIdToAssign) ||
            board.members.some(m => m.user.equals(userIdToAssign));

        if (!isMember) {
            throw createError(400, 'User is not a member of this board');
        }

        if (task.assignees.includes(userIdToAssign)) {
            throw createError(409, 'User is already assigned to this task');
        }

        task.assignees.push(userIdToAssign);
        await task.save({ session });

        await session.commitTransaction();

        return {
            taskId: task._id,
            assignedUserId: userIdToAssign,
            assignerId: currentUserId,
            currentAssignees: task.assignees
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in assignTaskService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const removeAssignmentService = async (
    taskId,
    userIdToRemove,
    currentUserId
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                select: 'board',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) throw createError(404, 'Task not found');

        const board = task.column.board;

        const isOwnerOrAdmin =
            board.owner.equals(currentUserId) ||
            board.members.some(
                m => m.user.equals(currentUserId) && m.role === 'admin'
            );

        const isRemovingSelf = currentUserId.equals(userIdToRemove);

        if (!isOwnerOrAdmin && !isRemovingSelf) {
            throw createError(
                403,
                'Only admins/owners can remove other users from tasks'
            );
        }

        if (!task.assignees.includes(userIdToRemove)) {
            throw createError(404, 'User is not assigned to this task');
        }

        task.assignees = task.assignees.filter(
            id => !id.equals(userIdToRemove)
        );
        await task.save({ session });

        await session.commitTransaction();

        return {
            taskId: task._id,
            removedUserId: userIdToRemove,
            removedBy: currentUserId,
            remainingAssignees: task.assignees
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in removeAssignmentService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const getColumnTasksService = async (columnId, userId, filterOptions = {}) => {
    try {
        const {
            filter = 'all',
            sort = '-createdAt',
            priority,
            search = ''
        } = filterOptions;

        const column = await Columns.findById(columnId).populate(
            'board',
            'owner members'
        );

        if (!column) {
            throw createError(404, 'Column not found');
        }

        const hasAccess =
            column.board.owner.equals(userId) ||
            column.board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(
                403,
                'No permission to view tasks in this column'
            );
        }

        const query = { column: columnId };

        switch (filter) {
            case 'completed':
                query.completed = true;
                break;
            case 'pending':
                query.completed = false;
                break;
            case 'assigned-to-me':
                query.assignees = userId;
                break;
        }

        if (priority) {
            query.priority = priority;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOption = {};
        switch (sort) {
            case 'dueDate':
                sortOption.dueDate = 1;
                break;
            case '-dueDate':
                sortOption.dueDate = -1;
                break;
            case 'priority':
                sortOption.priority = 1;
                break;
            case '-priority':
                sortOption.priority = -1;
                break;
            case 'createdAt':
                sortOption.createdAt = 1;
                break;
            case '-createdAt':
                sortOption.createdAt = -1;
                break;
        }

        const tasks = await Tasks.find(query)
            .sort(sortOption)
            .populate('assignees', 'firstName lastName avatar')
            .populate('createdBy', 'firstName lastName');

        return {
            success: true,
            count: tasks.length,
            data: tasks,
            filters: {
                applied: {
                    filter,
                    priority,
                    search
                },
                available: {
                    filter: ['all', 'completed', 'pending', 'assigned-to-me'],
                    priority: ['low', 'medium', 'high']
                }
            },
            sort: {
                applied: sort,
                available: [
                    'dueDate',
                    '-dueDate',
                    'priority',
                    '-priority',
                    'createdAt',
                    '-createdAt'
                ]
            }
        };
    } catch (err) {
        console.error('Error in getColumnTasksService:', err.message);
        throw err;
    }
};

module.exports = {
    createTaskService,
    getTaskDetailsService,
    updateTaskService,
    deleteTaskService,
    moveTaskService,
    assignTaskService,
    removeAssignmentService,
    getColumnTasksService
};
