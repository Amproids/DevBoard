const createError = require('http-errors');
const boardService = require('../services/boards');
const boardValidator = require('../validators/boards');

const createBoardController = async (req, res, next) => {
    try {
        const { error } = boardValidator.validateCreateBoardInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const boardData = {
            ...req.body,
            owner: req.user.id
        };

        const newBoard = await boardService.createBoardService(boardData);

        res.status(201).json({
            success: true,
            data: newBoard,
            message: 'Board created successfully'
        });
    } catch (err) {
        console.error('Error in createBoardController:', err.message);

        if (err.status === 400 || err.status === 409) {
            next(err);
        } else {
            next(createError(500, 'Error creating board'));
        }
    }
};

const updateBoardController = async (req, res, next) => {
    try {
        const { error } = boardValidator.validateUpdateBoardInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const userId = req.user.id;

        const updatedBoard = await boardService.updateBoardService(
            req.params.id,
            req.body,
            userId
        );

        res.status(200).json({
            success: true,
            data: updatedBoard,
            message: 'Board updated successfully'
        });
    } catch (err) {
        console.error('Error in updateBoardController:', err.message);

        if (
            err.status === 400 ||
            err.status === 401 ||
            err.status === 404 ||
            err.status === 409
        ) {
            next(err);
        } else {
            next(createError(500, 'Error updating board'));
        }
    }
};

const deleteBoardController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            throw createError(401, 'Authentication required');
        }

        const result = await boardService.deleteBoardService(
            req.params.id,
            userId
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Board deleted successfully'
        });
    } catch (err) {
        console.error('Error in deleteBoardController:', err.message);

        if (err.status === 400 || err.status === 401 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error deleting board'));
        }
    }
};

const getBoardsController = async (req, res, next) => {
    try {
        const { error } = boardValidator.validateGetBoardsInput(req.query);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const userId = req.user.id;
        if (!userId) {
            throw createError(401, 'Authentication required');
        }

        const { filter, sort, search } = req.query;

        const result = await boardService.getBoardsService(userId, {
            filter,
            sort,
            search
        });

        res.status(200).json({
            success: true,
            data: result.data,
            meta: {
                count: result.count,
                filters: result.filters,
                sort: result.sort
            },
            message: 'Boards retrieved successfully'
        });
    } catch (err) {
        console.error('Error in getBoardsController:', err.message);

        if (err.status === 400 || err.status === 401) {
            next(err);
        } else {
            next(createError(500, 'Error retrieving boards'));
        }
    }
};

module.exports = {
    createBoardController,
    updateBoardController,
    deleteBoardController,
    getBoardsController
};
