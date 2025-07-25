const router = require('express').Router();
const invitationController = require('../controllers/invitations.js');
const { ensureAuth } = require('../middlewares/auth');

router.get(
    '/:boardId/invitations',
    ensureAuth,
    invitationController.getBoardInvitationsController
);
router.get(
    '/:token/verify',
    invitationController.verifyInvitationTokenController
);
router.get(
    '/pending',
    ensureAuth,
    invitationController.getPendingInvitationsController
);
router.post(
    '/:boardId/invite',
    ensureAuth,
    invitationController.inviteToBoardController
);
router.post(
    '/:token/accept',
    ensureAuth,
    invitationController.acceptInvitationController
);
router.post(
    '/:token/reject',
    ensureAuth,
    invitationController.rejectInvitationController
);
router.delete(
    '/:invitationId',
    ensureAuth,
    invitationController.cancelInvitationController
);

module.exports = router;
