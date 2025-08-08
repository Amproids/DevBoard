const createError = require('http-errors');
const Boards = require('../models').boards;
const Users = require('../models').users;
const Invitations = require('../models').invitations;
const Columns = require('../models').columns;

const verifyMembersExist = async members => {
    const userIds = members.map(m => m.user);
    const existingUsers = await Users.find({ _id: { $in: userIds } }).select(
        '_id'
    );

    const nonExistingUsers = userIds.filter(
        userId =>
            !existingUsers.some(u => u._id.toString() === userId.toString())
    );

    if (nonExistingUsers.length > 0) {
        throw createError(
            400,
            `The following users don't exist: ${nonExistingUsers.join(', ')}`
        );
    }
};

const createBoardService = async boardData => {
    try {
        if (!boardData.name || !boardData.owner) {
            throw createError(400, 'Name and owner are required');
        }

        const ownerExists = await Users.exists({ _id: boardData.owner });
        if (!ownerExists) {
            throw createError(400, 'Owner user does not exist');
        }

        const members = boardData.members || [
            {
                user: boardData.owner,
                role: 'admin'
            }
        ];

        await verifyMembersExist(members);

        const newBoard = new Boards({
            name: boardData.name,
            description: boardData.description || '',
            owner: boardData.owner,
            members: members,
            tags: boardData.tags || [],
            lockedColumns: boardData.lockedColumns || false
        });

        const savedBoard = await newBoard.save();

        const populatedBoard = await Boards.findById(savedBoard._id)
            .populate('owner', 'firstName lastName email avatar')
            .populate('members.user', 'firstName lastName email avatar');

        return populatedBoard;
    } catch (err) {
        console.error(
            'Error in boards.service.js -> createBoard:',
            err.message
        );

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            throw createError(400, `Validation error: ${messages.join(', ')}`);
        } else if (err.code === 11000) {
            throw createError(409, 'Board name must be unique for this user');
        }
        throw err;
    }
};

const updateBoardService = async (boardId, updateData, userId) => {
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
                404,
                'Board not found or you dont have permission'
            );
        }

        const updates = Object.keys(updateData);
        const allowedUpdates = [
            'name',
            'description',
            'members',
            'isFavorite',
            'tags',
            'lockedColumns'
        ];
        const isValidOperation = updates.every(update =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            throw createError(400, 'Invalid updates!');
        }

        if (updateData.members) {
            await verifyMembersExist(updateData.members);
        }

        updates.forEach(update => {
            if (update === 'members') {
                board.members = updateData.members.filter(
                    (member, index, self) =>
                        index ===
                        self.findIndex(
                            m => m.user.toString() === member.user.toString()
                        )
                );
            } else {
                board[update] = updateData[update];
            }
        });

        const updatedBoard = await board.save();

        const populatedBoard = await Boards.findById(updatedBoard._id)
            .populate('owner', 'firstName lastName email avatar')
            .populate('members.user', 'firstName lastName email avatar');

        return populatedBoard;
    } catch (err) {
        console.error(
            'Error in boards.service.js -> updateBoard:',
            err.message
        );

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            throw createError(400, `Validation error: ${messages.join(', ')}`);
        } else if (err.code === 11000) {
            throw createError(409, 'Board name must be unique for this user');
        }
        throw err; // Re-lanzamos el error si ya es un error HTTP
    }
};

const updateColumnOrderService = async (boardId, columnIds, userId) => {
    try {
        // Find board and check permissions
        const board = await Boards.findOne({
            _id: boardId,
            $or: [
                { owner: userId },
                { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } }
            ]
        });

        if (!board) {
            throw createError(404, 'Board not found or you dont have permission to modify it');
        }

        // Validate that all provided column IDs belong to this board
        const boardColumnIds = board.columns.map(col => col.toString());
        const invalidColumns = columnIds.filter(id => !boardColumnIds.includes(id));
        
        if (invalidColumns.length > 0) {
            throw createError(400, 'Invalid column IDs provided');
        }

        // Validate that we have all columns (no missing ones)
        if (columnIds.length !== boardColumnIds.length) {
            throw createError(400, 'All board columns must be included in the reorder');
        }

        // Update the board's columns array with new order
        const updatedBoard = await Boards.findByIdAndUpdate(
            boardId,
            { columns: columnIds },
            { new: true }
        ).populate({
            path: 'columns',
            populate: { 
                path: 'tasks',
                populate: {
                    path: 'assignees',
                    select: 'firstName lastName avatar email'
                }
            }
        }).populate('owner', 'firstName lastName email avatar')
        .populate('members.user', 'firstName lastName email avatar');

        return updatedBoard;
    } catch (err) {
        console.error('Error in boards.service.js -> updateColumnOrder:', err.message);
        
        if (err.name === 'CastError') {
            throw createError(400, 'Invalid board ID format');
        }
        throw err;
    }
};

const deleteBoardService = async (boardId, userId) => {
    try {
        const board = await Boards.findOneAndDelete({
            _id: boardId,
            owner: userId
        });

        if (!board) {
            throw createError(
                404,
                'Board not found or you dont have permission to delete it'
            );
        }

        // Optional: Eliminate others resources
        // such as columns, tareas, etc.
        // Eliminar las invitaciones asociadas al board
        await Invitations.deleteMany({ board: boardId });
        await Columns.deleteMany({ board: boardId });

        return {
            success: true,
            message: 'Board deleted successfully',
            deletedBoard: board
        };
    } catch (err) {
        console.error(
            'Error in boards.service.js -> deleteBoard:',
            err.message
        );

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid board ID format');
        }
        throw err;
    }
};

const getBoardsService = async (userId, filterOptions = {}) => {
    try {
        const {
            filter = 'all',
            sort = '-createdAt',
            search = ''
        } = filterOptions;

        let query = {
            $or: [{ owner: userId }, { 'members.user': userId }]
        };

        switch (filter) {
            case 'favorites':
                query.isFavorite = true;
                break;
            case 'owned':
                query.owner = userId;
                break;
        }

        if (search) {
            query.$and = [
                { $or: [{ owner: userId }, { 'members.user': userId }] },
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        let sortOption = {};
        if (sort === 'name' || sort === '-name') {
            sortOption.name = sort === 'name' ? 1 : -1;
        } 
        else if (sort === '-updatedAt') {
            sortOption.updatedAt = -1;
        }
        else {
            sortOption.createdAt = sort === 'createdAt' ? 1 : -1;
        }

        const boards = await Boards.find(query)
            .sort(sortOption)
            .populate({
                path: 'owner',
                select: 'firstName lastName email avatar'
            })
            .populate({
                path: 'members.user',
                select: 'firstName lastName email avatar'
            })
            .populate({
                path: 'columns',
                select: 'name order isLocked tasks',
                populate: {
                    path: 'tasks',
                    select: 'title description dueDate priority assignees',
                    populate: {
                        path: 'assignees',
                        select: 'firstName lastName avatar email'
                    }
                }
            });

        return {
            success: true,
            count: boards.length,
            data: boards,
            filters: {
                applied: filter,
                available: ['all', 'favorites', 'owned']
            },
            sort: {
                applied: sort,
                available: ['name', '-name', 'createdAt', '-createdAt', '-updatedAt']
            }
        };
    } catch (err) {
        console.error('Error in boards.service.js -> getBoards:', err.message);
        throw createError(500, 'Error retrieving boards');
    }
};

const getBoardService = async (boardId, userId) => {
    try {
        if (!boardId) {
            throw createError(400, 'Board ID is required');
        }

        // Find board where user is either owner or member
        const board = await Boards.findOne({
            _id: boardId,
            $or: [{ owner: userId }, { 'members.user': userId }]
        })
            .populate({
                path: 'owner',
                select: 'firstName lastName email avatar'
            })
            .populate({
                path: 'members.user',
                select: 'firstName lastName email avatar'
            })
            .populate({
                path: 'columns',
                select: 'name order isLocked tasks',
                populate: {
                    path: 'tasks',
                    select: 'title description dueDate priority assignees',
                    populate: {
                        path: 'assignees',
                        select: 'firstName lastName avatar email'
                    }
                }
            });

        if (!board) {
            throw createError(404, 'Board not found or you dont have permission to view it');
        }

        return board;
    } catch (err) {
        console.error('Error in boards.service.js -> getBoard:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid board ID format');
        }
        
        throw err;
    }
};

module.exports = {
    createBoardService,
    updateBoardService,
    updateColumnOrderService,
    deleteBoardService,
    getBoardsService,
    getBoardService
};