const createError = require('http-errors');
const { validateLoginInput } = require('../validators/users.js');
const authService = require('../services/auth.js');

const loginController = async (req, res, next) => {
    try {
        const { error } = validateLoginInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const { email, password } = req.body;

        const result = await authService.loginService(email, password);

        res.status(200).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            },
            message: 'User logged in successfully'
        });
    } catch (err) {
        console.log(err.message);
        if (err.status === 400) {
            next(err);
        } else if (err.status === 401) {
            next(createError(401, 'Invalid credentials'));
        } else if (err.status === 404) {
            next(createError(404, 'User not found'));
        } else {
            next(createError(500, 'Error during login process'));
        }
    }
};

module.exports = {
    loginController
};
