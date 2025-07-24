const router = require('express').Router();
const userController = require('../controllers/users.js');
const { ensureAuth } = require('../middlewares/auth');

router.get('/', userController.getUsersController);
router.post('/register', userController.registerUsersController);
router.put('/:id', userController.updateUsersProfileController);
router.delete('/:id', userController.deletUsersController);

module.exports = router;
