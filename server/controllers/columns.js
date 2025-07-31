const createError = require('http-errors');
const columnService = require('../services/columns');
const columnValidator = require('../validators/columns');

const createColumnController = async (req, res, next) => {
    try {
        const { error } = columnValidator.validateCreateColumnInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const newColumn = await columnService.createColumnService(
            req.params.boardId,
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            data: newColumn,
            message: 'Column created successfully'
        });
    } catch (err) {
        console.error('Error in createColumnController:', err.message);
        next(err);
    }
};

const updateColumnController = async (req, res, next) => {
    try {
        const { error } = columnValidator.validateUpdateColumnInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const updatedColumn = await columnService.updateColumnService(
            req.params.columnId,
            req.body,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: updatedColumn,
            message: 'Column updated successfully'
        });
    } catch (err) {
        console.error('Error in updateColumnController:', err.message);
        next(err);
    }
};

const getColumnsController = async (req, res, next) => {
    try {
        const { error } = columnValidator.validateGetColumnsInput(req.query);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await columnService.getColumnsByBoardService(
            req.params.boardId,
            req.user.id,
            {
                sort: req.query.sort,
                populateTasks: req.query.populateTasks === 'true'
            }
        );

        res.status(200).json({
            success: true,
            data: {
                boardLocked: result.boardLocked,
                count: result.count,
                columns: result.columns
            },
            message: 'Columns retrieved successfully'
        });
    } catch (err) {
        console.error('Error in getColumnsController:', err.message);
        next(err);
    }
};

const deleteColumnController = async (req, res, next) => {
    try {
        const { error } = columnValidator.validateDeleteColumnInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await columnService.deleteColumnService(
            req.params.columnId,
            req.user.id,
            {
                action: req.body.action,
                targetColumnId: req.body.targetColumnId
            }
        );

        res.status(200).json({
            success: true,
            data: result,
            message: `Column deleted successfully (${result.tasksAffected} tasks ${result.actionTaken.replace('-', ' ')})`
        });
    } catch (err) {
        console.error('Error in deleteColumnController:', err.message);
        next(err);
    }
};

const lockColumnController = async (req, res, next) => {
    try {
        const { error } = columnValidator.validateLockColumnInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await columnService.lockColumnService(
            req.params.columnId,
            req.body.isLocked,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: `Column ${result.isLocked ? 'locked' : 'unlocked'} successfully`
        });
    } catch (err) {
        console.error('Error in lockColumnController:', err.message);
        next(err);
    }
};

module.exports = {
    createColumnController,
    updateColumnController,
    getColumnsController,
    deleteColumnController,
    lockColumnController
};
