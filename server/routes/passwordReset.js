const router = require('express').Router();
const passwordResetController = require('../controllers/passwordReset.js');

router.post('/reset/code', passwordResetController.sendResetCodePassword);

router.post('/reset', passwordResetController.resetPassword);

module.exports = router;
