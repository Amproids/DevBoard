const createError = require('http-errors');
const userService = require('../services/users.js');
const userValidator = require('../validators/users.js');
const Users = require('../models').users;

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
        const { error } = userValidator.validateRegisterInput(req.body);
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

const updateUsersProfileController = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await Users.findById(userId).select('+password');
        if (!user) {
            throw createError(404, 'User not found');
        }

        const { error } = userValidator.validateUpdateInput(
            req.body,
            !!user.password
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const updatedUser = await userService.updateUsersProfileService(
            userId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });
    } catch (err) {
        console.log(err.message);

        if (err.status === 400 || err.status === 404 || err.status === 409) {
            next(err);
        } else {
            next(createError(500, 'Error updating profile'));
        }
    }
};

const deletUsersController = async (req, res, next) => {
    try {
        const currentUserId = req.params.id;

        const result = await userService.deleteUsersService(
            currentUserId,
            currentUserId
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Your account has been deleted successfully'
        });
    } catch (err) {
        console.log('Error in deleteMyAccountController:', err.message);

        if (err.status === 403 || err.status === 404 || err.status === 500) {
            next(err);
        } else {
            next(createError(500, 'Error deleting account'));
        }
    }
};

module.exports = {
    getUsersController,
    registerUsersController,
    updateUsersProfileController,
    deletUsersController
};
