const router = require('express').Router();
const tasksController = require('../controllers/tasks.js');
const { ensureAuth } = require('../middlewares/auth');

router.get(
    '/:columnId/tasks',
    ensureAuth,
    tasksController.getColumnTasksController
);
router.get('/:taskId', ensureAuth, tasksController.getTaskDetailsController);
router.post(
    '/:taskId/assign',
    ensureAuth,
    tasksController.assignTaskController
);
router.post('/:columnId', ensureAuth, tasksController.createTaskController);
router.patch('/:taskId/move', ensureAuth, tasksController.moveTaskController);
router.patch('/:taskId', ensureAuth, tasksController.updateTaskController);
router.delete(
    '/:taskId/assign/:userId',
    ensureAuth,
    tasksController.removeAssignmentController
);
router.delete('/:taskId', ensureAuth, tasksController.deleteTaskController);

module.exports = router;
