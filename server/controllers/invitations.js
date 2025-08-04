const createError = require('http-errors');
const invitationService = require('../services/invitations');
const invitationValidator = require('../validators/invitations');

const inviteToBoardController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateInviteToBoardInput(
            req.body
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const boardId = req.params.boardId;
        const { email, role } = req.body;
        const inviterId = req.user.id;

        const result = await invitationService.inviteToBoardService(
            boardId,
            email,
            role,
            inviterId
        );

        res.status(201).json({
            success: true,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in inviteToBoardController:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error sending invitation'));
        }
    }
};

const getBoardInvitationsController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateListInvitationsInput(
            req.query
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const boardId = req.params.boardId;
        const userId = req.user.id;
        const { status, limit, page } = req.query;

        const result = await invitationService.getBoardInvitationsService(
            boardId,
            userId,
            { status, limit, page }
        );

        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: result.message
        });
    } catch (err) {
        console.error('Error in getBoardInvitationsController:', err.message);

        if (err.status === 400 || err.status === 403) {
            next(err);
        } else {
            next(createError(500, 'Error retrieving invitations'));
        }
    }
};

const cancelInvitationController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateInvitationId(
            req.params.invitationId
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const invitationId = req.params.invitationId;
        const userId = req.user.id;

        const result = await invitationService.cancelInvitationService(
            invitationId,
            userId
        );

        res.status(200).json({
            success: true,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in cancelInvitationController:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error cancelling invitation'));
        }
    }
};

const getPendingInvitationsController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validatePendingInvitationsInput(
            req.query
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const userEmail = req.user.email;
        const { limit, page, sort } = req.query;

        const result = await invitationService.getPendingInvitationsService(
            userEmail,
            { limit, page, sort }
        );

        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: result.message
        });
    } catch (err) {
        console.error('Error in getPendingInvitationsController:', err.message);

        if (err.status === 400) {
            next(err);
        } else {
            next(createError(500, 'Error retrieving pending invitations'));
        }
    }
};

const acceptInvitationController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateTokenInput(
            req.params.token
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const token = req.params.token;
        const userId = req.user.id;

        const result = await invitationService.acceptInvitationService(
            token,
            userId
        );

        res.status(200).json({
            success: true,
            data: result.data || null,
            message: result.message
        });
    } catch (err) {
        console.error('Error in acceptInvitationController:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error accepting invitation'));
        }
    }
};

const rejectInvitationController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateTokenInput(
            req.params.token
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const token = req.params.token;
        const userId = req.user._id || req.user.id;

        const result = await invitationService.rejectInvitationService(
            token,
            userId
        );

        res.status(200).json({
            success: true,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in rejectInvitationController:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            next(err);
        } else {
            next(createError(500, 'Error rejecting invitation'));
        }
    }
};

const verifyInvitationTokenController = async (req, res, next) => {
    try {
        const { error } = invitationValidator.validateTokenInput(
            req.params.token
        );
        if (error) {
            const errorMessages = error.details
                .map(detail => detail.message)
                .join('; ');
            throw createError(400, `Validation failed: ${errorMessages}`);
        }

        const result = await invitationService.verifyInvitationTokenService(
            req.params.token
        );

        res.status(200).json({
            success: true,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in verifyInvitationTokenController:', err.message);

        if (err.status === 400) {
            next(err);
        } else {
            next(createError(500, 'Error verifying invitation token'));
        }
    }
};

module.exports = {
    inviteToBoardController,
    getBoardInvitationsController,
    cancelInvitationController,
    getPendingInvitationsController,
    acceptInvitationController,
    rejectInvitationController,
    verifyInvitationTokenController
};
