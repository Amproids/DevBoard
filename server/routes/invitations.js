const router = require('express').Router();
const invitationController = require('../controllers/invitations.js');
const { ensureAuth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Invitations
 *     description: Board invitation management
 */

/**
 * @swagger
 * /boards/{boardId}/invitations:
 *   get:
 *     tags: [Invitations]
 *     summary: Get board invitations
 *     description: Retrieve invitations for a specific board (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, all]
 *           default: "pending"
 *         description: Filter by invitation status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of invitations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationListResponse'
 *       400:
 *         description: Invalid query parameters
 *       403:
 *         description: Not authorized to view invitations
 *       500:
 *         description: Server error
 */
router.get(
    '/:boardId/invitations',
    ensureAuth,
    invitationController.getBoardInvitationsController
);

/**
 * @swagger
 * /invitations/pending:
 *   get:
 *     tags: [Invitations]
 *     summary: Get pending invitations
 *     description: Retrieve pending invitations for current user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: "newest"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of pending invitations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationListResponse'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get(
    '/pending',
    ensureAuth,
    invitationController.getPendingInvitationsController
);

/**
 * @swagger
 * /boards/{boardId}/invite:
 *   post:
 *     tags: [Invitations]
 *     summary: Invite user to board
 *     description: Send invitation to join a board (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvitationInput'
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invitation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or validation error
 *       403:
 *         description: Not authorized to invite users
 *       404:
 *         description: Board not found
 *       409:
 *         description: User already invited or member
 *       500:
 *         description: Server error
 */
router.post(
    '/:boardId/invite',
    ensureAuth,
    invitationController.inviteToBoardController
);

/**
 * @swagger
 * /invitations/{token}/verify:
 *   get:
 *     tags: [Invitations]
 *     summary: Verify invitation token
 *     description: Verify if an invitation token is valid
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     invitation:
 *                       $ref: '#/components/schemas/Invitation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:token/verify',
    invitationController.verifyInvitationTokenController
);

/**
 * @swagger
 * /invitations/{token}/accept:
 *   post:
 *     tags: [Invitations]
 *     summary: Accept invitation
 *     description: Accept a board invitation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invitation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token
 *       403:
 *         description: Not authorized to accept this invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
router.post(
    '/:token/accept',
    ensureAuth,
    invitationController.acceptInvitationController
);

/**
 * @swagger
 * /invitations/{token}/reject:
 *   post:
 *     tags: [Invitations]
 *     summary: Reject invitation
 *     description: Reject a board invitation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invitation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token
 *       403:
 *         description: Not authorized to reject this invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
router.post(
    '/:token/reject',
    ensureAuth,
    invitationController.rejectInvitationController
);

/**
 * @swagger
 * /invitations/{invitationId}:
 *   delete:
 *     tags: [Invitations]
 *     summary: Cancel invitation
 *     description: Cancel a pending invitation (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invitation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid invitation ID
 *       403:
 *         description: Not authorized to cancel this invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:invitationId',
    ensureAuth,
    invitationController.cancelInvitationController
);

module.exports = router;
