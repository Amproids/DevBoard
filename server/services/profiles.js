const createError = require('http-errors');
const Users = require('../models').users;

module.exports = {
    // update first name, last name, display name, and OAuth fields
    updateProfile: async (userId, updateData) => {
        try {
            const user = await Users.findById(userId);
            if (!user) {
                throw createError(404, 'User not found');
            }
            
            // Update basic profile fields
            if (updateData.firstName !== undefined) {
                user.firstName = updateData.firstName;
            }
            if (updateData.lastName !== undefined) {
                user.lastName = updateData.lastName;
            }
            if (updateData.displayName !== undefined) {
                user.displayName = updateData.displayName || updateData.firstName;
            }
            // TODO - file management with avatar
            // if (updateData.avatar !== undefined) {
            //     user.avatar = updateData.avatar;
            // }
            
            // Support unlinking OAuth accounts (setting to null)
            if (updateData.googleId !== undefined) {
                user.googleId = updateData.googleId;
            }
            if (updateData.githubId !== undefined) {
                user.githubId = updateData.githubId;
            }
            if (updateData.username !== undefined) {
                user.username = updateData.username;
            }
            
            const updatedUser = await user.save();
            const userToReturn = updatedUser.toObject();
            delete userToReturn.password;
            return userToReturn;
        } catch (error) {
            console.error(
                'Error in profiles.service.js -> updateProfile:',
                error.message
            );
            throw error;
        }
    },

    // get profile aka get user information - now includes password field for hasPassword check
    getProfile: async userId => {
        try {
            // Include password field to check existence, but we'll remove it before returning
            const user = await Users.findById(userId).select('+password');
            if (!user) {
                throw createError(404, 'User not found');
            }
            return user; // Return the full user object so controller can check password existence
        } catch (error) {
            console.error(
                'Error in profiles.service.js -> getProfile:',
                error.message
            );
            throw error;
        }
    },

    // update credentials including email, password, and phone number optional
    updateCredential: async (userId, updateData) => {
        try {
            const user = await Users.findById(userId);
            if (!user) {
                throw createError(404, 'User not found');
            }
            
            // Update fields only if provided
            if (updateData.email !== undefined) {
                user.email = updateData.email;
            }
            if (updateData.password !== undefined) {
                user.password = updateData.password; // null to remove, string to set
            }
            if (updateData.phoneNumber !== undefined) {
                user.phoneNumber = updateData.phoneNumber;
            }
            
            const updatedUser = await user.save();
            const userToReturn = updatedUser.toObject();
            delete userToReturn.password;
            return userToReturn;
        } catch (error) {
            console.error(
                'Error in profiles.service.js -> updateCredential:',
                error.message
            );
            throw error;
        }
    }
};