const Joi = require('joi');

module.exports = {
    validateUpdateProfile: data => {
        const schema = Joi.object({
            firstName: Joi.string().required().messages({
                'string.empty': 'First name is required',
                'any.required': 'First name is required'
            }),
            lastName: Joi.string().required().messages({
                'string.empty': 'Last name is required',
                'any.required': 'Last name is required'
            }),
            displayName: Joi.string().optional(),
            avatar: Joi.string().optional().uri().messages({
                'string.uri': 'Avatar must be a valid URL'
            })
        }).messages({
            'object.unknown': 'Unexpected field detected: {{#label}}'
        });

        return schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    },

    validateUpdateCredentials: data => {
        const schema = Joi.object({
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
            phoneNumber: Joi.string().optional()
        }).messages({
            'object.unknown': 'Unexpected field detected: {{#label}}'
        });

        return schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    }
};
