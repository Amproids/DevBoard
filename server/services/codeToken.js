const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { code_tokens: CodeToken } = require('../models');
const Users = require('../models').users;
const createError = require('http-errors');

// Generate a random 6-character alphanumeric token
const generate6CharToken = () => {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Hash the token using bcrypt
const hashToken = async (token) => {
	const saltRounds = 10;
	return bcrypt.hash(token, saltRounds);
};

const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE || 'Gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD
	}
});

const sendResetCodeEmail = async (email, token) => {
	const mailOptions = {
		from: `"DevBoard Team" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: 'Your Password Reset Code',
		html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>Hello,</h2>
                <p>Your password reset code is:</p>
                <p style="font-size: 1.5em; font-weight: bold; color: #007bff;">${token}</p>
                <p>This code will expire in <b>7 minutes</b>. If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>
                <span style="color: #555;">The DevBoard Team</span></p>
            </div>
        `
	};
	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending reset code email:', error);
		return false;
	}
};

const createCodeTokenService = async (email) => {
	try {
		const token = generate6CharToken();
		const hashedToken = await hashToken(token);
		const expiresAt = new Date();
		// Set expiration time to 7 minutes
		expiresAt.setMinutes(expiresAt.getMinutes() + 1);

		// Create a new token
		await CodeToken.create({
			email,
			token: hashedToken,
			expiresAt
		});

		// Automatically remove token after 7 minutes
		setTimeout(async () => {
			try {
				await CodeToken.deleteMany({ email });
			} catch (err) {
				console.error(`Error auto-removing code token for ${email}:`, err.message);
			}
		}, 7 * 60 * 1000); // 7 minutes in milliseconds

		return token;
	} catch (err) {
		console.error('Error in codeToken.service.js -> createCodeTokenService:', err.message);
		throw createError(500, 'Error during code token creation process');
	}
};

const verifyCodeTokenService = async (email, token) => {
	try {
		const codeToken = await CodeToken.findOne({ email });

		if (!codeToken) {
			throw createError(401, 'Invalid or expired token');
		}

		if (new Date() > codeToken.expiresAt) {
			await CodeToken.deleteMany({ email });
			throw createError(401, 'Token has expired');
		}

		const isMatch = await bcrypt.compare(token, codeToken.token);
		if (!isMatch) {
			throw createError(401, 'Invalid or expired token');
		}

		return true;
	} catch (err) {
		console.error('Error in codeToken.service.js -> verifyCodeTokenService:', err.message);
		if (err.status === 401) {
			throw err;
		}
		throw createError(500, 'Error during token verification process');
	}
};

const updatePassword = async (email, newPassword) => {
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            throw createError(404, 'User not found');
        }
        user.password = newPassword;
        await user.save(); 
        return true;
    } catch (err) {
        console.error('Error in codeToken.service.js -> updatePassword:', err.message);
        throw createError(500, 'Error updating password');
    }
};

module.exports = {
	createCodeTokenService,
	verifyCodeTokenService,
	sendResetCodeEmail,
	updatePassword
};