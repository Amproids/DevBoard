const router = require('express').Router();

router.use('/', require('./swagger'));
router.use('/users', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/boards', require('./boards'));
router.use('/invitations', require('./invitations'));

module.exports = router;
