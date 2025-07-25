const router = require('express').Router();
const boardController = require('../controllers/boards.js');
const { ensureAuth } = require('../middlewares/auth');

router.get('/', ensureAuth, boardController.getBoardsController);
router.post('/', ensureAuth, boardController.createBoardController);
router.put('/:id', ensureAuth, boardController.updateBoardController);
router.delete('/:id', ensureAuth, boardController.deleteBoardController);

module.exports = router;
