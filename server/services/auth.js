const createError = require('http-errors');
const Users = require('../models').users;
const jwt = require('../config/jwt');

const loginService = async (email, password) => {
    try {
        const user = await Users.findOne({ email }).select('+password');

        if (!user) {
            throw createError(401, 'Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw createError(401, 'Invalid credentials');
        }

        const token = jwt.generateToken(user);

        const userToReturn = user.toObject();
        delete userToReturn.password;

        return { user: userToReturn, token };
    } catch (err) {
        console.error(
            'Error in users.service.js -> loginWithEmail:',
            err.message
        );

        if (err.status === 401) {
            throw err;
        }
        throw createError(500, 'Error during login process');
    }
};

module.exports = {
    loginService
};
