const createError = require('http-errors');
const Users = require('../models').users;
const jwt = require('../config/jwt');

const getAllUsersService = async () => {
    try {
        const users = await Users.find({});
        if (!users || users.length === 0) {
            throw createError(404, 'Users not found');
        }
        return users;
    } catch (err) {
        console.error('Error in users.service.js -> getAllUsers:', err.message);
        if (err.status === 404) {
            throw err;
        }
        throw createError(500, 'Error retrieving users from database');
    }
};

const registerUsersService = async userData => {
    try {
        const existingUser = await Users.findOne({ email: userData.email });
        if (existingUser) {
            throw createError(409, 'Email already in use');
        }

        const newUser = new Users({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            displayName: `${userData.firstName} ${userData.lastName}`
        });

        const savedUser = await newUser.save();

        const userToReturn = savedUser.toObject();
        delete userToReturn.password;

        return userToReturn;
    } catch (err) {
        console.error(
            'Error in users.service.js -> registerWithEmail:',
            err.message
        );

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            throw createError(400, `Validation error: ${messages.join(', ')}`);
        } else if (err.code === 11000) {
            throw createError(409, 'Email already exists');
        } else if (err.status === 409) {
            throw err;
        }
        throw createError(500, 'Error registering new user');
    }
};

const updateUsersProfileService = async (userId, updateData) => {
    try {
        const allowedUpdates = [
            'firstName',
            'lastName',
            'email',
            'password',
            'avatar',
            'currentPassword'
        ];
        const updates = Object.keys(updateData);

        const isValidOperation = updates.every(update =>
            allowedUpdates.includes(update)
        );
        if (!isValidOperation) {
            throw createError(400, 'Invalid updates!');
        }

        const user = await Users.findById(userId).select('+password');
        if (!user) {
            throw createError(404, 'User not found');
        }

        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await Users.findOne({
                email: updateData.email
            });
            if (emailExists) {
                throw createError(409, 'Email already in use');
            }
        }

        if (updateData.password) {
            if (user.password && !updateData.currentPassword) {
                throw createError(400, 'Current password is required');
            }

            if (user.password) {
                const isMatch = await user.comparePassword(
                    updateData.currentPassword
                );
                if (!isMatch) {
                    throw createError(401, 'Current password is incorrect');
                }
            }
        }

        updates.forEach(update => {
            if (update !== 'currentPassword') {
                user[update] = updateData[update];
            }
        });

        const updatedUser = await user.save();

        const userToReturn = updatedUser.toObject();
        delete userToReturn.password;
        delete userToReturn.__v;

        return userToReturn;
    } catch (err) {
        console.error(
            'Error in users.service.js -> updateUserProfile:',
            err.message
        );

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            throw createError(400, `Validation error: ${messages.join(', ')}`);
        } else if (err.code === 11000) {
            throw createError(409, 'Email already exists');
        } else if (
            err.status === 400 ||
            err.status === 401 ||
            err.status === 404 ||
            err.status === 409
        ) {
            throw err;
        }
        throw createError(500, 'Error updating user profile');
    }
};

const deleteUsersService = async (userId, currentUserId, isAdmin = false) => {
    try {
        const userToDelete = await Users.findById(userId);
        if (!userToDelete) {
            throw createError(404, 'User not found');
        }

        if (
            userToDelete._id.toString() !== currentUserId.toString() &&
            !isAdmin
        ) {
            throw createError(403, 'Not authorized to delete this user');
        }

        await Users.findByIdAndDelete(userId);

        return {
            success: true,
            message: 'User deleted successfully',
            deletedUserId: userId
        };
    } catch (err) {
        console.error('Error in deleteUserService:', err.message);

        if (err.status === 403 || err.status === 404) {
            throw err;
        }
        throw createError(500, 'Error deleting user');
    }
};

module.exports = {
    getAllUsersService,
    registerUsersService,
    updateUsersProfileService,
    deleteUsersService
};
