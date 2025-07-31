const router = require('express').Router();
const columnsController = require('../controllers/columns.js');
const { ensureAuth } = require('../middlewares/auth');

router.get(
    '/:boardId',
    ensureAuth,
    columnsController.getColumnsController
);
router.post('/:boardId', ensureAuth, columnsController.createColumnController);
router.put('/:columnId', ensureAuth, columnsController.updateColumnController);
router.delete(
    '/:columnId',
    ensureAuth,
    columnsController.deleteColumnController
);
router.patch(
    '/:columnId',
    ensureAuth,
    columnsController.lockColumnController
);

module.exports = router;
