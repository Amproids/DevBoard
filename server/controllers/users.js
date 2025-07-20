const createError = require('http-errors');
const userService = require('../services/users.js');
const {
    validateRegisterInput,
    validateLoginInput
} = require('../validators/users.js');

exports.getUsersController = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(201).json({
            success: true,
            data: users,
            message: 'Users retrieved successfully'
        });
    } catch (err) {
        console.log(err.message);
        if (err.status === 404) {
            next(createError(404, 'Users does not exist.'));
        } else {
            next(createError(500, 'Error retrieving users.'));
        }
    }
};

exports.registerUsersController = async (req, res, next) => {
    try {
        const { error } = validateRegisterInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        };

        const newUser = await userService.registerWithEmail(userData);

        res.status(201).json({
            success: true,
            data: newUser,
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.loginUserController = async (req, res, next) => {
    try {
        const { error } = validateLoginInput(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const { email, password } = req.body;

        const result = await userService.loginWithEmail(email, password);

        res.status(200).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            },
            message: 'User logged in successfully'
        });
    } catch (error) {
        if (error.status === 401) {
            next(createError(401, 'Invalid credentials'));
        } else {
            next(error);
        }
    }
};
