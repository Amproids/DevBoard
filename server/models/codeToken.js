const mongoose = require('mongoose');

module.exports = mongoose => {
	const codeTokenSchema = mongoose.Schema(
		{
			email: {
				type: String,
				required: true,
				index: true
			},
			token: {
				type: String,
				required: true
			},
			expiresAt: {
				type: Date,
				required: true
			}
		},
		{
			timestamps: true
		}
	);

	const CodeToken = mongoose.model('code_tokens', codeTokenSchema);
	return CodeToken;
};