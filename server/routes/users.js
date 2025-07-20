const router = require('express').Router();
const {
    getUsersController,
    registerUsersController
} = require('../controllers/users');
const { ensureAuth } = require('../middlewares/auth');

router.get('/', ensureAuth, getUsersController);
router.post('/register', registerUsersController);

module.exports = router;
