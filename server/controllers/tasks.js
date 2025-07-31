const createError = require('http-errors');
const taskService = require('../services/tasks');
const taskValidator = require('../validators/tasks');

const createTaskController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateCreateTaskInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const newTask = await taskService.createTaskService(
            req.params.columnId,
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            data: newTask,
            message: 'Task created successfully'
        });
    } catch (err) {
        console.error('Error in createTaskController:', err.message);
        next(err);
    }
};

const getTaskDetailsController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateTaskId(req.params.taskId);
        if (error) {
            throw createError(
                400,
                `Invalid task ID: ${error.details[0].message}`
            );
        }

        const taskDetails = await taskService.getTaskDetailsService(
            req.params.taskId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: taskDetails,
            message: 'Task details retrieved successfully'
        });
    } catch (err) {
        console.error('Error in getTaskDetailsController:', err.message);
        next(err);
    }
};

const updateTaskController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateUpdateTaskInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const updatedTask = await taskService.updateTaskService(
            req.params.taskId,
            req.body,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: 'Task updated successfully'
        });
    } catch (err) {
        console.error('Error in updateTaskController:', err.message);
        next(err);
    }
};

const deleteTaskController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateTaskId(req.params.taskId);
        if (error) {
            throw createError(
                400,
                `Invalid task ID: ${error.details[0].message}`
            );
        }

        const result = await taskService.deleteTaskService(
            req.params.taskId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: `Task deleted successfully (${result.deletedComments} comments and ${result.deletedAttachments} attachments removed)`
        });
    } catch (err) {
        console.error('Error in deleteTaskController:', err.message);
        next(err);
    }
};

const moveTaskController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateMoveTaskInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await taskService.moveTaskService(
            req.params.taskId,
            req.body,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message:
                result.previousColumnId === result.newColumnId
                    ? 'Task reordered successfully'
                    : 'Task moved to new column successfully'
        });
    } catch (err) {
        console.error('Error in moveTaskController:', err.message);
        next(err);
    }
};

const assignTaskController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateAssignTaskInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await taskService.assignTaskService(
            req.params.taskId,
            req.body.userId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'User assigned to task successfully'
        });
    } catch (err) {
        console.error('Error in assignTaskController:', err.message);
        next(err);
    }
};

const removeAssignmentController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateTaskAndUserId(
            req.params.taskId,
            req.params.userId
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await taskService.removeAssignmentService(
            req.params.taskId,
            req.params.userId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'User removed from task successfully'
        });
    } catch (err) {
        console.error('Error in removeAssignmentController:', err.message);
        next(err);
    }
};

const getColumnTasksController = async (req, res, next) => {
    try {
        const { error } = taskValidator.validateGetColumnTasksInput(req.query);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await taskService.getColumnTasksService(
            req.params.columnId,
            req.user.id,
            req.query
        );

        res.status(200).json({
            success: true,
            data: result.data,
            meta: {
                count: result.count,
                filters: result.filters,
                sort: result.sort
            },
            message: 'Tasks retrieved successfully'
        });
    } catch (err) {
        console.error('Error in getColumnTasksController:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error retrieving tasks'));
        }
    }
};

module.exports = {
    createTaskController,
    getTaskDetailsController,
    updateTaskController,
    deleteTaskController,
    moveTaskController,
    assignTaskController,
    removeAssignmentController,
    getColumnTasksController
};
