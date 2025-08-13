const Joi = require('joi');

module.exports = {
    validateUpdateProfile: data => {
        const schema = Joi.object({
            firstName: Joi.string().optional().messages({
                'string.empty': 'First name cannot be empty'
            }),
            lastName: Joi.string().optional().messages({
                'string.empty': 'Last name cannot be empty'
            }),
            displayName: Joi.string().optional(),
            // avatar: Joi.string().optional().uri().messages({
            //     'string.uri': 'Avatar must be a valid URL'
            // }),
            // Add support for OAuth fields for unlinking
            googleId: Joi.string().allow(null).optional(),
            githubId: Joi.string().allow(null).optional(),
            username: Joi.string().allow(null).optional()
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
                .optional() // Make email optional for password-only updates
                .messages({
                    'string.empty': 'Email cannot be empty',
                    'string.email': 'Please enter a valid email address'
                }),
            password: Joi.string()
                .min(6)
                .optional() // Password is optional - only allow setting, not removing
                .messages({
                    'string.empty': 'Password cannot be empty',
                    'string.min': 'Password must be at least 6 characters long'
                }),
            phoneNumber: Joi.string().allow('').optional()
        })
            .or('email', 'password', 'phoneNumber') // Require at least one field
            .messages({
                'object.unknown': 'Unexpected field detected: {{#label}}',
                'object.missing':
                    'At least one field (email, password, or phoneNumber) must be provided'
            });

        return schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
    }
};
