const createError = require('http-errors');
const crypto = require('crypto');
const Invitations = require('../models').invitations;
const Boards = require('../models').boards;
const Users = require('../models').users;
const { sendInvitationEmail } = require('./email');

const inviteToBoardService = async (boardId, email, role, inviterId) => {
    try {
        const board = await Boards.findOne({
            _id: boardId,
            $or: [
                { owner: inviterId },
                { 'members.user': inviterId, 'members.role': 'admin' }
            ]
        });

        if (!board) {
            throw createError(
                403,
                'You dont have permission to invite to this board'
            );
        }

        const owner = await Users.findById(board.owner);
        if (owner.email === email) {
            throw createError(400, 'The board owner cannot be invited');
        }

        const invitedUser = await Users.findOne({ email });
        if (invitedUser) {
            const isAlreadyMember = board.members.some(
                member => member.user.toString() === invitedUser._id.toString()
            );
            if (isAlreadyMember) {
                throw createError(
                    400,
                    'User is already a member of this board'
                );
            }
        }

        const existingInvitation = await Invitations.findOne({
            board: boardId,
            email,
            status: 'pending'
        });
        if (existingInvitation) {
            throw createError(
                400,
                'There is already a pending invitation for this user'
            );
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newInvitation = new Invitations({
            email,
            board: boardId,
            role,
            token,
            expiresAt,
            invitedBy: inviterId,
            status: 'pending'
        });

        const savedInvitation = await newInvitation.save();

        const inviter = await Users.findById(inviterId).select(
            'firstName lastName email'
        );
        const inviterName = `${inviter.firstName} ${inviter.lastName}`;

        await sendInvitationEmail(email, token, board.name, inviterName);

        return {
            success: true,
            data: savedInvitation,
            message: 'Invitation sent successfully'
        };
    } catch (err) {
        console.error('Error in inviteToBoardService:', err.message);

        if (err.status === 400 || err.status === 403) {
            throw err;
        }
        throw createError(500, 'Error sending invitation');
    }
};

const getBoardInvitationsService = async (boardId, userId, options = {}) => {
    try {
        const board = await Boards.findOne({
            _id: boardId,
            $or: [
                { owner: userId },
                { 'members.user': userId, 'members.role': 'admin' }
            ]
        });

        if (!board) {
            throw createError(
                403,
                'You dont have permission to view invitations for this board'
            );
        }

        const { status = 'pending', limit = 20, page = 1 } = options;

        const query = { board: boardId };
        if (status !== 'all') {
            query.status = status;
        }

        const invitations = await Invitations.find(query)
            .populate('invitedBy', 'firstName lastName email avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Invitations.countDocuments(query);

        return {
            success: true,
            data: invitations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                status
            },
            message: 'Invitations retrieved successfully'
        };
    } catch (err) {
        console.error('Error in getBoardInvitationsService:', err.message);

        if (err.status === 403) {
            throw err;
        }
        throw createError(500, 'Error retrieving invitations');
    }
};

const cancelInvitationService = async (invitationId, userId) => {
    try {
        const invitation = await Invitations.findOne({
            _id: invitationId
        }).populate({
            path: 'board',
            select: 'owner members'
        });

        if (!invitation) {
            throw createError(404, 'Invitation not found');
        }

        const isOwner = invitation.board.owner.toString() === userId.toString();
        const isAdmin = invitation.board.members.some(
            member =>
                member.user.toString() === userId.toString() &&
                member.role === 'admin'
        );

        if (!isOwner && !isAdmin) {
            throw createError(
                403,
                'You dont have permission to cancel this invitation'
            );
        }

        if (invitation.status !== 'pending') {
            throw createError(400, 'Only pending invitations can be cancelled');
        }

        const updatedInvitation = await Invitations.findByIdAndUpdate(
            invitationId,
            { status: 'rejected' },
            { new: true }
        );

        // Opción 2: Eliminar el register completely
        // await Invitations.findByIdAndDelete(invitationId);

        return {
            success: true,
            data: updatedInvitation,
            message: 'Invitation cancelled successfully'
        };
    } catch (err) {
        console.error('Error in cancelInvitationService:', err.message);

        if (err.status === 400 || err.status === 403 || err.status === 404) {
            throw err;
        }
        throw createError(500, 'Error cancelling invitation');
    }
};

const getPendingInvitationsService = async (userEmail, options = {}) => {
    try {
        const { limit = 20, page = 1, sort = 'newest' } = options;

        const query = {
            email: userEmail,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        };

        const sortOption =
            sort === 'newest' ? { createdAt: -1 } : { createdAt: 1 };

        const invitations = await Invitations.find(query)
            .populate({
                path: 'board',
                select: 'name description owner',
                populate: {
                    path: 'owner',
                    select: 'firstName lastName email avatar'
                }
            })
            .populate('invitedBy', 'firstName lastName email avatar')
            .sort(sortOption)
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Invitations.countDocuments(query);

        return {
            success: true,
            data: invitations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                sort
            },
            message: 'Pending invitations retrieved successfully'
        };
    } catch (err) {
        console.error('Error in getPendingInvitationsService:', err.message);
        throw createError(500, 'Error retrieving pending invitations');
    }
};

const acceptInvitationService = async (token, userId) => {
    try {
        const invitation = await Invitations.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        }).populate('board');

        if (!invitation) {
            throw createError(
                404,
                'Invitation not found, expired or already processed'
            );
        }

        const user = await Users.findById(userId);
        if (user.email !== invitation.email) {
            throw createError(403, 'This invitation is not for your account');
        }

        const isAlreadyMember = invitation.board.members.some(
            member => member.user.toString() === userId.toString()
        );
        if (isAlreadyMember) {
            await Invitations.findByIdAndUpdate(invitation._id, {
                status: 'accepted'
            });
            return {
                success: true,
                message: 'User is already member of this board',
                board: invitation.board
            };
        }

        invitation.board.members.push({
            user: userId,
            role: invitation.role
        });

        await invitation.board.save();

        await Invitations.findByIdAndUpdate(invitation._id, {
            status: 'accepted'
        });

        return {
            success: true,
            data: {
                board: invitation.board,
                role: invitation.role
            },
            message: 'Invitation accepted successfully'
        };
    } catch (err) {
        console.error('Error in acceptInvitationService:', err.message);

        if (err.status === 403 || err.status === 404) {
            throw err;
        }
        throw createError(500, 'Error accepting invitation');
    }
};

const rejectInvitationService = async (token, userId) => {
    try {
        const invitation = await Invitations.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            throw createError(
                404,
                'Invitation not found, expired or already processed'
            );
        }

        const user = await Users.findById(userId);
        if (user.email !== invitation.email) {
            throw createError(403, 'This invitation is not for your account');
        }

        const updatedInvitation = await Invitations.findByIdAndUpdate(
            invitation._id,
            { status: 'rejected' },
            { new: true }
        );

        return {
            success: true,
            data: updatedInvitation,
            message: 'Invitation rejected successfully'
        };
    } catch (err) {
        console.error('Error in rejectInvitationService:', err.message);

        if (err.status === 403 || err.status === 404) {
            throw err;
        }
        throw createError(500, 'Error rejecting invitation');
    }
};

const verifyInvitationTokenService = async token => {
    try {
        const invitation = await Invitations.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        }).populate('board', 'name owner');

        if (!invitation) {
            throw createError(
                404,
                'Invitation not found, expired or already processed'
            );
        }

        const userExists = await Users.exists({ email: invitation.email });

        return {
            success: true,
            data: {
                valid: true,
                email: invitation.email,
                boardName: invitation.board.name,
                boardId: invitation.board._id,
                role: invitation.role,
                userExists: userExists,
                invitedBy: invitation.invitedBy
            },
            message: 'Token is valid'
        };
    } catch (err) {
        if (err.status === 404) {
            return {
                success: true,
                data: {
                    valid: false,
                    reason: err.message
                },
                message: 'Token is invalid'
            };
        }
        throw err;
    }
};

module.exports = {
    inviteToBoardService,
    getBoardInvitationsService,
    cancelInvitationService,
    getPendingInvitationsService,
    acceptInvitationService,
    rejectInvitationService,
    verifyInvitationTokenService
};
