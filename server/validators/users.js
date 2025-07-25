const Joi = require('joi');

const validateRegisterInput = data => {
    const schema = Joi.object({
        firstName: Joi.string().required().messages({
            'string.empty': 'First name is required',
            'any.required': 'First name is required'
        }),

        lastName: Joi.string().required().messages({
            'string.empty': 'Last name is required',
            'any.required': 'Last name is required'
        }),

        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),

        password: Joi.string().min(6).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),

        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'string.empty': 'Please confirm your password',
                'any.only': 'Passwords do not match',
                'any.required': 'Please confirm your password'
            })
    }).messages({
        'object.unknown': 'Unexpected field detected: {{#label}}'
    });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

const validateLoginInput = data => {
    const schema = Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
                'any.required': 'Email is required'
            }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    });
    return schema.validate(data, { abortEarly: false });
};

const validateUpdateInput = (data, userHasPassword = false) => {
    const schema = Joi.object({
        firstName: Joi.string().messages({
            'string.empty': 'First name cannot be empty'
        }),

        lastName: Joi.string().messages({
            'string.empty': 'Last name cannot be empty'
        }),

        email: Joi.string()
            .email({ tlds: { allow: false } })
            .messages({
                'string.empty': 'Email cannot be empty',
                'string.email': 'Please enter a valid email address'
            }),

        password: Joi.string().min(6).messages({
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password must be at least 6 characters long'
        }),

        currentPassword: Joi.string().when('password', {
            is: Joi.exist(),
            then: Joi.when(Joi.ref('$userHasPassword'), {
                is: true,
                then: Joi.string().required().messages({
                    'string.empty':
                        'Current password is required to change password',
                    'any.required':
                        'Current password is required to change password'
                }),
                otherwise: Joi.string().optional().allow('')
            })
        }),

        avatar: Joi.string().uri().messages({
            'string.uri': 'Please enter a valid URL for the avatar'
        })
    })
        .min(1)
        .messages({
            'object.min': 'At least one field is required to update',
            'object.unknown': 'Unexpected field detected: {{#label}}'
        });

    return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        context: { userHasPassword }
    });
};

module.exports = {
    validateRegisterInput,
    validateLoginInput,
    validateUpdateInput
};
