const Joi = require('joi');

const validateCreateColumnInput = data => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            'string.empty': 'Column name is required',
            'string.min': 'Column name must be at least 3 characters long',
            'string.max': 'Column name cannot exceed 50 characters',
            'any.required': 'Column name is required'
        }),

        isLocked: Joi.boolean().default(false).messages({
            'boolean.base': 'Locked status must be a boolean value'
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateUpdateColumnInput = data => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).messages({
            'string.empty': 'Column name cannot be empty',
            'string.min': 'Column name must be at least 3 characters long',
            'string.max': 'Column name cannot exceed 50 characters'
        }),

        order: Joi.number().integer().min(0).messages({
            'number.base': 'Order must be a number',
            'number.integer': 'Order must be an integer',
            'number.min': 'Order cannot be negative'
        }),

        isLocked: Joi.boolean().messages({
            'boolean.base': 'Locked status must be a boolean value'
        }),

        taskOrder: Joi.array().items(Joi.string().hex().length(24)).messages({
            'array.base': 'Task order must be an array of task IDs',
            'string.hex': 'Task ID must be a valid MongoDB ID',
            'string.length': 'Task ID must be 24 characters long'
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

const validateGetColumnsInput = data => {
    const schema = Joi.object({
        sort: Joi.string().valid('order', '-order').default('order').messages({
            'any.only': 'Sort must be either "order" or "-order"'
        }),
        populateTasks: Joi.boolean().default(false).messages({
            'boolean.base': 'populateTasks must be a boolean value'
        })
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateDeleteColumnInput = data => {
    const schema = Joi.object({
        action: Joi.string()
            .valid('delete-tasks', 'move-tasks')
            .required()
            .messages({
                'any.only':
                    'Action must be either "delete-tasks" or "move-tasks"',
                'any.required': 'Action is required'
            }),

        targetColumnId: Joi.when('action', {
            is: 'move-tasks',
            then: Joi.string().hex().length(24).required().messages({
                'string.hex': 'Target column ID must be a valid MongoDB ID',
                'string.length': 'Target column ID must be 24 characters long',
                'any.required': 'Target column is required when moving tasks'
            }),
            otherwise: Joi.forbidden()
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false
    });
};

const validateLockColumnInput = data => {
    const schema = Joi.object({
        isLocked: Joi.boolean().required().messages({
            'boolean.base': 'Lock status must be a boolean value',
            'any.required': 'Lock status is required'
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

module.exports = {
    validateCreateColumnInput,
    validateUpdateColumnInput,
    validateGetColumnsInput,
    validateDeleteColumnInput,
    validateLockColumnInput
};
