const router = require('express').Router();
const userController = require('../controllers/users.js');
const { ensureAuth } = require('../middlewares/auth');

router.get('/', ensureAuth, userController.getUsersController);
router.post('/register', userController.registerUsersController);

module.exports = router;
