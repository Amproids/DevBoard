const createError = require('http-errors');
const userService = require('../services/users.js');
const { validateRegisterInput } = require('../validators/users.js');

const getUsersController = async (req, res, next) => {
    try {
        const users = await userService.getAllUsersService();
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

const registerUsersController = async (req, res, next) => {
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

        const newUser = await userService.registerUsersService(userData);

        res.status(201).json({
            success: true,
            data: newUser,
            message: 'User registered successfully'
        });
    } catch (err) {
        console.log(err.message);
        if (err.code === 11000) {
            next(createError(409, 'Email already exists.'));
        } else if (err.status === 400) {
            next(err);
        } else {
            next(createError(500, 'Error registering user.'));
        }
    }
};

module.exports = {
    getUsersController,
    registerUsersController
};
