const Joi = require('joi');

const validateCreateBoardInput = data => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            'string.empty': 'Board name is required',
            'string.min': 'Board name must be at least 3 characters long',
            'string.max': 'Board name cannot exceed 50 characters',
            'any.required': 'Board name is required'
        }),

        description: Joi.string().max(200).optional().messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),

        members: Joi.array()
            .items(
                Joi.object({
                    user: Joi.string().hex().length(24).required().messages({
                        'string.hex': 'User ID must be a valid MongoDB ID',
                        'string.length': 'User ID must be 24 characters long',
                        'any.required': 'Member user ID is required'
                    }),
                    role: Joi.string()
                        .valid('admin', 'editor', 'viewer')
                        .default('editor')
                        .messages({
                            'any.only':
                                'Role must be either admin, editor, or viewer'
                        })
                })
            )
            .optional()
            .messages({
                'array.base': 'Members must be an array of user objects'
            }),

        tags: Joi.array().items(Joi.string().max(20)).optional().messages({
            'array.base': 'Tags must be an array of strings',
            'string.max': 'Each tag cannot exceed 20 characters'
        }),

        lockedColumns: Joi.boolean().default(false).messages({
            'boolean.base': 'Locked columns must be a boolean value'
        })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateUpdateBoardInput = data => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).messages({
            'string.empty': 'Board name cannot be empty',
            'string.min': 'Board name must be at least 3 characters long',
            'string.max': 'Board name cannot exceed 50 characters'
        }),

        description: Joi.string().max(200).allow('').messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),

        members: Joi.array()
            .items(
                Joi.object({
                    user: Joi.string().hex().length(24).required().messages({
                        'string.hex': 'User ID must be a valid MongoDB ID',
                        'string.length': 'User ID must be 24 characters long',
                        'any.required': 'Member user ID is required'
                    }),
                    role: Joi.string()
                        .valid('admin', 'editor', 'viewer')
                        .default('editor')
                        .messages({
                            'any.only':
                                'Role must be either admin, editor, or viewer'
                        })
                })
            )
            .messages({
                'array.base': 'Members must be an array of user objects'
            }),

        isFavorite: Joi.boolean().messages({
            'boolean.base': 'isFavorite must be a boolean value'
        }),

        tags: Joi.array().items(Joi.string().max(20)).messages({
            'array.base': 'Tags must be an array of strings',
            'string.max': 'Each tag cannot exceed 20 characters'
        }),

        lockedColumns: Joi.boolean().messages({
            'boolean.base': 'Locked columns must be a boolean value'
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

const validateGetBoardsInput = data => {
    const schema = Joi.object({
        filter: Joi.string()
            .valid('all', 'favorites', 'owned')
            .default('all')
            .messages({
                'any.only':
                    'Filter must be either "all", "favorites" or "owned"'
            }),
        sort: Joi.string()
            .valid('name', '-name', 'createdAt', '-createdAt')
            .default('-createdAt')
            .messages({
                'any.only':
                    'Sort must be either "name", "-name", "createdAt" or "-createdAt"'
            }),
        search: Joi.string().allow('').optional()
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

module.exports = {
    validateCreateBoardInput,
    validateUpdateBoardInput,
    validateGetBoardsInput
};
