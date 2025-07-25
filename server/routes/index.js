const router = require('express').Router();

router.use("/", require("./swagger"));
router.use('/users', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/boards', require('./boards'));

module.exports = router;
