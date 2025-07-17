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

    createUser: async userData => {
        try {
            const newUser = new Users({
                firstName: userData.firstName,
                lastName: userData.lastName,
                googleId: userData.googleId,
                displayName: userData.displayName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                profile: userData.profile
            });

            const savedUser = await newUser.save();

            if (!savedUser) {
                throw createError(400, 'User was not created.');
            }

            return savedUser;
        } catch (error) {
            console.error(
                'Error in users.service.js -> createUser:',
                error.message
            );

            // Manejo específico de errores de validación
            if (error.name === 'ValidationError') {
                throw createError(422, error.message);
            }

            throw error; // Re-lanzamos otros errores
        }
    }
};
