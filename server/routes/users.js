const router = require('express').Router();
const {
    getUsersController,
    registerUsersController
} = require('../controllers/users');

router.get('/', getUsersController);
router.post('/register', registerUsersController);

module.exports = router;
