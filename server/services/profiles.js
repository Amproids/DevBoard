const createError = require('http-errors');
const Users = require('../models').users;

module.exports = {
	// update first name, last name, and display name
	// TODO - file management with avatar
	updateProfile: async (userId, updateData) => {
		try {
			const user = await Users.findById(userId);
			if (!user) {
				throw createError(404, 'User not found');
			}

			user.firstName = updateData.firstName;
			user.lastName = updateData.lastName;
			// user.avatar = updateData.avatar;
			user.displayName = updateData.displayName ? updateData.displayName : updateData.firstName;

			const updatedUser = await user.save();

			const userToReturn = updatedUser.toObject();
			delete userToReturn.password;

			return userToReturn;
		} catch (error) {
			console.error(
				'Error in users.service.js -> updateProfile:',
				error.message
			);
			throw error;
		}
	},

	// get profile aka get user information without password
	getProfile: async (userId) => {
		try {
			const user = await Users.findById(userId).select('-password');
			if (!user) {
				throw createError(404, 'User not found');
			}
			return user.toObject();
		} catch (error) {
			console.error(
				'Error in users.service.js -> getProfile:',
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
			user.email = updateData.email;
			user.password = updateData.password;
			user.phoneNumber = updateData.phoneNumber;

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
	},
};
