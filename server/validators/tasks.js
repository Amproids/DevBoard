const Joi = require('joi');

const validateCreateTaskInput = data => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required().messages({
            'string.empty': 'Task title is required',
            'string.min': 'Task title must be at least 3 characters long',
            'string.max': 'Task title cannot exceed 100 characters',
            'any.required': 'Task title is required'
        }),
        description: Joi.string().max(500).allow('').messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
        dueDate: Joi.date().iso().greater('now').optional().messages({
            'date.base': 'Due date must be a valid date',
            'date.greater': 'Due date must be in the future'
        }),
        priority: Joi.string()
            .valid('low', 'medium', 'high')
            .default('medium')
            .messages({
                'any.only': 'Priority must be either low, medium, or high'
            }),
        tags: Joi.array().items(Joi.string().max(20)).optional().messages({
            'array.base': 'Tags must be an array of strings',
            'string.max': 'Each tag cannot exceed 20 characters'
        }),
        assignees: Joi.array()
            .items(Joi.string().hex().length(24))
            .optional()
            .messages({
                'array.base': 'Assignees must be an array of user IDs',
                'string.hex': 'User ID must be a valid MongoDB ID',
                'string.length': 'User ID must be 24 characters long'
            })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateTaskId = taskId => {
    const schema = Joi.string().hex().length(24).required().messages({
        'string.hex': 'Task ID must be a valid MongoDB ID',
        'string.length': 'Task ID must be 24 characters long',
        'any.required': 'Task ID is required'
    });

    return schema.validate(taskId);
};

const validateUpdateTaskInput = data => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).messages({
            'string.empty': 'Task title cannot be empty',
            'string.min': 'Task title must be at least 3 characters long',
            'string.max': 'Task title cannot exceed 100 characters'
        }),
        description: Joi.string().max(500).allow('').messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
        dueDate: Joi.date().iso().greater('now').messages({
            'date.base': 'Due date must be a valid date',
            'date.greater': 'Due date must be in the future'
        }),
        priority: Joi.string().valid('low', 'medium', 'high').messages({
            'any.only': 'Priority must be either low, medium, or high'
        }),
        tags: Joi.array().items(Joi.string().max(20)).messages({
            'array.base': 'Tags must be an array of strings',
            'string.max': 'Each tag cannot exceed 20 characters'
        }),
        assignees: Joi.array().items(Joi.string().hex().length(24)).messages({
            'array.base': 'Assignees must be an array of user IDs',
            'string.hex': 'User ID must be a valid MongoDB ID',
            'string.length': 'User ID must be 24 characters long'
        }),
        completed: Joi.boolean().messages({
            'boolean.base': 'Completed must be a boolean value (true or false)'
        }),
        order: Joi.number().integer().min(0).messages({
            'number.base': 'Order must be a number',
            'number.integer': 'Order must be an integer',
            'number.min': 'Order cannot be negative'
        }),
        column: Joi.string().hex().length(24).messages({
            'string.hex': 'Column ID must be a valid MongoDB ID',
            'string.length': 'Column ID must be 24 characters long'
        })
    })
        .min(1)
        .messages({
            'object.min': 'At least one field is required to update',
            'object.unknown': 'Unexpected field detected: {{#label}}'
        });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateMoveTaskInput = data => {
    const schema = Joi.object({
        targetColumnId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'Column ID must be a valid MongoDB ID',
            'string.length': 'Column ID must be 24 characters long',
            'any.required': 'Target column is required'
        }),
        newOrder: Joi.number().integer().min(0).required().messages({
            'number.base': 'Order must be a number',
            'number.integer': 'Order must be an integer',
            'number.min': 'Order cannot be negative',
            'any.required': 'New order position is required'
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateAssignTaskInput = data => {
    const schema = Joi.object({
        userId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'User ID must be a valid MongoDB ID',
            'string.length': 'User ID must be 24 characters long',
            'any.required': 'User ID is required'
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateTaskAndUserId = (taskId, userId) => {
    const schema = Joi.object({
        taskId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'Task ID must be a valid MongoDB ID',
            'string.length': 'Task ID must be 24 characters long',
            'any.required': 'Task ID is required'
        }),
        userId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'User ID must be a valid MongoDB ID',
            'string.length': 'User ID must be 24 characters long',
            'any.required': 'User ID is required'
        })
    });

    return schema.validate({ taskId, userId }, { abortEarly: false });
};

const validateGetColumnTasksInput = data => {
    const schema = Joi.object({
        filter: Joi.string()
            .valid('all', 'completed', 'pending', 'assigned-to-me')
            .default('all')
            .messages({
                'any.only':
                    'Filter must be either "all", "completed", "pending", or "assigned-to-me"'
            }),
        sort: Joi.string()
            .valid(
                'dueDate',
                '-dueDate',
                'priority',
                '-priority',
                'createdAt',
                '-createdAt'
            )
            .default('-createdAt')
            .messages({
                'any.only':
                    'Sort must be either "dueDate", "-dueDate", "priority", "-priority", "createdAt", or "-createdAt"'
            }),
        priority: Joi.string().valid('low', 'medium', 'high').optional(),
        search: Joi.string().allow('').optional()
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

module.exports = {
    validateCreateTaskInput,
    validateTaskId,
    validateUpdateTaskInput,
    validateMoveTaskInput,
    validateAssignTaskInput,
    validateTaskAndUserId,
    validateGetColumnTasksInput
};
