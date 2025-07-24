const createError = require('http-errors');
const Users = require('../models').users;
const jwt = require('../config/jwt');

const updateUserProfile = async (userId, updateData) => {
    try {
        // Campos permitidos para actualización
        const allowedUpdates = [
            'firstName',
            'lastName',
            'email',
            'password',
            'avatar'
        ];
        const updates = Object.keys(updateData);

        // Validar campos permitidos
        const isValidOperation = updates.every(update =>
            allowedUpdates.includes(update)
        );
        if (!isValidOperation) {
            throw createError(400, 'Invalid updates!');
        }

        // Buscar usuario y actualizar
        const user = await Users.findById(userId);
        if (!user) {
            throw createError(404, 'User not found');
        }

        // Verificar si el nuevo email ya existe (si se está actualizando el email)
        if (updateData.email && updateData.email !== user.email) {
            const emailExists = await Users.findOne({
                email: updateData.email
            });
            if (emailExists) {
                throw createError(409, 'Email already in use');
            }
        }

        // Aplicar las actualizaciones
        updates.forEach(update => (user[update] = updateData[update]));

        // Si se actualiza la contraseña, se hashea automáticamente con pre-save hook
        const updatedUser = await user.save();

        // Eliminar campos sensibles antes de retornar
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
        } else if (
            err.status === 404 ||
            err.status === 400 ||
            err.status === 409
        ) {
            throw err; // Errores ya creados con createError
        }
        throw createError(500, 'Error updating user profile');
    }
};

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

module.exports = {
    getAllUsersService,
    registerUsersService,
    updateUserProfile
};
