const Joi = require('joi');

const validateInviteToBoardInput = data => {
    const schema = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),
        role: Joi.string()
            .valid('admin', 'editor', 'viewer')
            .default('editor')
            .messages({
                'any.only': 'Role must be either admin, editor, or viewer'
            })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateListInvitationsInput = data => {
    const schema = Joi.object({
        status: Joi.string()
            .valid('pending', 'accepted', 'rejected', 'all')
            .default('pending')
            .messages({
                'any.only':
                    'Status must be either pending, accepted, rejected or all'
            }),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1)
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateInvitationId = id => {
    const schema = Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invitation ID must be a valid MongoDB ID',
        'string.length': 'Invitation ID must be 24 characters long',
        'any.required': 'Invitation ID is required'
    });

    return schema.validate(id);
};

const validatePendingInvitationsInput = data => {
    const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
        sort: Joi.string().valid('newest', 'oldest').default('newest')
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateTokenInput = token => {
    const schema = Joi.string().required().messages({
        'string.empty': 'Token is required',
        'any.required': 'Token is required'
    });

    return schema.validate(token);
};

module.exports = {
    validateInviteToBoardInput,
    validateListInvitationsInput,
    validateInvitationId,
    validatePendingInvitationsInput,
    validateTokenInput
};
