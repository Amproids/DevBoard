const createError = require('http-errors');
const Columns = require('../models').columns;
const Boards = require('../models').boards;
const mongoose = require('mongoose');

const createColumnService = async (boardId, columnData, userId) => {
    try {
        const board = await Boards.findOne({
            _id: boardId,
            $or: [
                { owner: userId },
                { 'members.user': userId, 'members.role': 'admin' }
            ]
        });

        if (!board) {
            throw createError(
                403,
                'You do not have permission to create columns in this board'
            );
        }

        const lastColumn = await Columns.findOne({ board: boardId })
            .sort('-order')
            .select('order');
        const newOrder = lastColumn ? lastColumn.order + 1 : 0;

        const newColumn = new Columns({
            name: columnData.name,
            board: boardId,
            order: newOrder,
            isLocked: columnData.isLocked || false
        });

        const savedColumn = await newColumn.save();

        await Boards.findByIdAndUpdate(boardId, {
            $push: { columns: savedColumn._id }
        });

        return savedColumn;
    } catch (err) {
        console.error('Error in createColumnService:', err.message);
        if (err.name === 'ValidationError') {
            throw createError(400, `Invalid data: ${err.message}`);
        }
        throw err;
    }
};

const updateColumnService = async (columnId, updateData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const column = await Columns.findById(columnId)
            .populate('board', 'owner members')
            .session(session);

        if (!column) throw createError(404, 'Column not found');

        const isOwnerOrAdmin =
            column.board.owner.equals(userId) ||
            column.board.members.some(
                m => m.user.equals(userId) && m.role === 'admin'
            );

        if (!isOwnerOrAdmin) {
            throw createError(403, 'No permission to update this column');
        }

        if (updateData.taskOrder) {
            column.tasks = updateData.taskOrder;
            await column.save({ session });
            const populated = await column.populate('tasks');
            await session.commitTransaction();
            return populated;
        }

        if (updateData.order !== undefined) {
            const newOrder = updateData.order;
            const maxOrder =
                (await Columns.countDocuments({
                    board: column.board._id
                }).session(session)) - 1;

            if (newOrder < 0 || newOrder > maxOrder) {
                throw createError(
                    400,
                    `Order must be between 0 and ${maxOrder}`
                );
            }

            const existingColumn = await Columns.findOne({
                board: column.board._id,
                order: newOrder,
                _id: { $ne: columnId }
            }).session(session);

            if (existingColumn) {
                throw createError(409, {
                    message: 'Order position already taken',
                    conflictingColumnId: existingColumn._id,
                    suggestedOrder: await getNextAvailableOrder(
                        column.board._id,
                        newOrder
                    ),
                    currentMaxOrder: maxOrder
                });
            }
        }

        Object.keys(updateData).forEach(key => {
            if (key !== 'taskOrder') {
                column[key] = updateData[key];
            }
        });

        await column.save({ session });
        await session.commitTransaction();

        return column;
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in updateColumnService:', err.message);

        if (err.name === 'ValidationError') {
            throw createError(400, `Invalid data: ${err.message}`);
        }

        throw err;
    } finally {
        session.endSession();
    }
};

const getNextAvailableOrder = async (boardId, desiredOrder) => {
    const columns = await Columns.find({ board: boardId })
        .sort({ order: 1 })
        .select('order');

    for (let i = desiredOrder; i < columns.length; i++) {
        if (columns[i].order > i) {
            return i;
        }
    }

    return columns.length;
};

const getColumnsByBoardService = async (
    boardId,
    userId,
    filterOptions = {}
) => {
    try {
        const { sort = 'order', populateTasks = false } = filterOptions;

        // Verify board access
        const board = await Boards.findOne({
            _id: boardId,
            $or: [{ owner: userId }, { 'members.user': userId }]
        }).select('_id lockedColumns');

        if (!board) {
            throw createError(
                403,
                'No permission to view columns in this board'
            );
        }

        const query = { board: boardId };

        // Sort options
        let sortOption = {};
        if (sort === 'order' || sort === '-order') {
            sortOption.order = sort === 'order' ? 1 : -1;
        }

        let columnsQuery = Columns.find(query).sort(sortOption);

        // Optional population
        if (populateTasks) {
            columnsQuery = columnsQuery.populate({
                path: 'tasks',
                select: 'title description assignees dueDate',
                options: { sort: { createdAt: 1 } }
            });
        }

        const columns = await columnsQuery;

        return {
            success: true,
            count: columns.length,
            data: {
                boardLocked: board.lockedColumns || false,
                columns
            },
            filters: {
                applied: { populateTasks },
                available: {
                    populateTasks: [true, false]
                }
            },
            sort: {
                applied: sort,
                available: ['order', '-order']
            }
        };
    } catch (err) {
        console.error('Error in getColumnsByBoardService:', err.message);
        throw createError(500, 'Error retrieving columns');
    }
};

const deleteColumnService = async (columnId, userId, options = {}) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const column = await Columns.findById(columnId)
            .populate('board', 'owner members lockedColumns')
            .session(session);

        if (!column) {
            throw createError(404, 'Column not found');
        }

        const isOwner = column.board.owner.equals(userId);
        const isAdmin = column.board.members.some(
            m => m.user.equals(userId) && m.role === 'admin'
        );

        if (!isOwner && !isAdmin) {
            throw createError(
                403,
                'Only board owners/admins can delete columns'
            );
        }

        if (column.tasks.length > 0) {
            switch (options.action) {
                case 'delete-tasks':
                    await Tasks.deleteMany({
                        _id: { $in: column.tasks }
                    }).session(session);
                    break;

                case 'move-tasks':
                    const targetColumn = await Columns.findOne({
                        _id: options.targetColumnId,
                        board: column.board._id
                    }).session(session);

                    if (!targetColumn) {
                        throw createError(
                            400,
                            'Target column not found in this board'
                        );
                    }

                    await Tasks.updateMany(
                        { _id: { $in: column.tasks } },
                        { $set: { column: targetColumn._id } }
                    ).session(session);

                    targetColumn.tasks.push(...column.tasks);
                    await targetColumn.save({ session });
                    break;

                default:
                    throw createError(
                        400,
                        'Column contains tasks - specify an action'
                    );
            }
        }

        await Columns.deleteOne({ _id: columnId }).session(session);
        await Boards.updateOne(
            { _id: column.board._id },
            { $pull: { columns: columnId } }
        ).session(session);

        await session.commitTransaction();

        return {
            deletedColumnId: columnId,
            actionTaken: options.action || 'none',
            tasksAffected: column.tasks.length
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in deleteColumnService:', err.message);
        throw err;
    } finally {
        session.endSession();
    }
};

const lockColumnService = async (columnId, isLocked, userId) => {
    try {
        const column = await Columns.findById(columnId).populate(
            'board',
            'owner lockedColumns'
        );

        if (!column) {
            throw createError(404, 'Column not found');
        }

        if (!column.board.owner.equals(userId)) {
            throw createError(403, 'Only board owner can lock/unlock columns');
        }

        // 3. Update lock status
        column.isLocked = isLocked;
        const updatedColumn = await column.save();

        return {
            columnId: updatedColumn._id,
            boardId: column.board._id,
            isLocked: updatedColumn.isLocked,
            previousStatus: !isLocked
        };
    } catch (err) {
        console.error('Error in lockColumnService:', err.message);
        throw err;
    }
};

module.exports = {
    createColumnService,
    updateColumnService,
    getColumnsByBoardService,
    deleteColumnService,
    lockColumnService
};
