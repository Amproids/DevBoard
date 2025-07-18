const createError = require('http-errors');
const Users = require('../models').users;

module.exports = {
    getAllUsers: async () => {
        try {
            const users = await Users.find({});
            if (!users) {
                throw createError(404, 'Users not found');
            }
            return users;
        } catch (error) {
            console.error(
                'Error in users.service.js -> getAllUsers:',
                error.message
            );
            throw error;
        }
    },

    registerWithEmail: async userData => {
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
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(
                    val => val.message
                );
                throw createError(400, messages.join(', '));
            }
            throw error;
        }
    }
};
