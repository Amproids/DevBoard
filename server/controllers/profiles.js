const createError = require('http-errors');
const profileService = require('../services/profiles.js');
const {
    validateUpdateProfile,
    validateUpdateCredentials
} = require('../validators/profiles.js');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await profileService.getProfile(userId);
        res.status(200).json({
            success: true,
            data: profile,
            message: 'Profile retrieved successfully'
        });
    } catch (error) {
        if (error.status === 404) {
            next(createError(404, 'Profile not found'));
        } else {
            next(createError(error.status, error.message));
        }
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { error } = validateUpdateProfile(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }
        const userId = req.user.id;
        const updateData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            displayName: req.body.displayName,
            avatar: req.body.avatar
        };
        const updatedProfile = await profileService.updateProfile(userId, updateData);
        res.status(200).json({
            success: true,
            data: updatedProfile,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        if (error.status === 404) {
            next(createError(404, 'Profile not found'));
        } else {
            next(createError(error.status, error.message));
        }
    }
};

exports.updateCredentials = async (req, res, next) => {
    try {
        const { error } = validateUpdateCredentials(req.body);
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }
        const userId = req.user.id;
        const updateData = {
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        };
        const updatedCredentials = await profileService.updateCredential(userId, updateData);
        res.status(200).json({
            success: true,
            data: updatedCredentials,
            message: 'Credentials updated successfully'
        });
    } catch (error) {
        if (error.status === 404) {
            next(createError(404, 'Profile not found'));
        } else {
            next(createError(error.status, error.message));
        }
    }
};