const router = require('express').Router();
const {
    getProfile,
    updateProfile,
    updateCredentials
} = require('../controllers/profiles');
const { ensureAuth } = require('../middlewares/auth');

router.get('/', ensureAuth, getProfile);
router.put('/', ensureAuth, updateProfile);
router.put('/credential', ensureAuth, updateCredentials);

module.exports = router;
