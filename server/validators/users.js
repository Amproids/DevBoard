const Joi = require('joi');

module.exports = {
    validateRegisterInput: data => {
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
    },
    validateLoginInput: data => {
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
    }
};
