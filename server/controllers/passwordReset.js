const createError = require('http-errors');
const {
    createCodeTokenService,
    sendResetCodeEmail,
    updatePassword,
    verifyCodeTokenService
} = require('../services/codeToken');
const validateResetPassword = require('../validators/passwordReset');

exports.sendResetCodePassword = async (req, res) => {
    try {
        const { email } = req.body;

        // check if email is provided and valid
        if (
            !email ||
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
        ) {
            return res
                .status(400)
                .json({ message: 'A valid email is required' });
        }

        // Create a code token for the email
        const token = await createCodeTokenService(email);
        if (!token) {
            return res
                .status(500)
                .json({ message: 'Error generating reset code' });
        }

        // Send the reset code via email
        await sendResetCodeEmail(email, token);
        return res
            .status(200)
            .json({ message: 'Reset code sent successfully' });
    } catch (err) {
        console.error('Error sending reset code:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { error } = validateResetPassword(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const { email, code, newPassword } = req.body;

        // Verify the code token
        const isValid = await verifyCodeTokenService(email, code);
        if (!isValid) {
            return res
                .status(401)
                .json({ message: 'Invalid or expired reset code' });
        }

        // Update the user's password
        await updatePassword(email, newPassword);

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch {
        console.error('Error resetting password');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
