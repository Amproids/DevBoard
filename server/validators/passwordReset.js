const Joi = require('joi');

const validateResetPassword = data => {
	const schema = Joi.object({
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.messages({
				'string.empty': 'Email is required',
				'string.email': 'Please enter a valid email address',
				'any.required': 'Email is required'
			}),
		code: Joi.string()
			.required()
			.messages({
				'string.empty': 'Reset code is required',
				'any.required': 'Reset code is required'
			}),
		newPassword: Joi.string()
			.min(6)
			.required()
			.messages({
				'string.empty': 'New password is required',
				'string.min': 'New password must be at least 6 characters long',
				'any.required': 'New password is required'
			}),
		confirmPassword: Joi.string()
			.valid(Joi.ref('newPassword'))
			.required()
			.messages({
				'string.empty': 'Please confirm your new password',
				'any.only': 'Passwords do not match',
				'any.required': 'Please confirm your new password'
			})
	}).messages({
		'object.unknown': 'Unexpected field detected: {{#label}}'
	});

	return schema.validate(data, {
		abortEarly: false,
		allowUnknown: true
	});
};

module.exports = validateResetPassword;