const router = require('express').Router();
const tasksController = require('../controllers/tasks.js');
const { ensureAuth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management
 */

/**
 * @swagger
 * /tasks/{columnId}:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     description: Create a new task in a column (board members only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Column ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid assignees
 *       403:
 *         description: No permission to create tasks
 *       404:
 *         description: Column not found
 *       500:
 *         description: Server error
 */
router.post('/:columnId', ensureAuth, tasksController.createTaskController);

/**
 * @swagger
 * /tasks/{columnId}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get column tasks
 *     description: Retrieve tasks in a column with filtering options
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Column ID
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, completed, pending, assigned-to-me]
 *           default: "all"
 *         description: Filter criteria
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [dueDate, -dueDate, priority, -priority, createdAt, -createdAt]
 *           default: "-createdAt"
 *         description: Sort order
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksResponse'
 *       400:
 *         description: Invalid query parameters
 *       403:
 *         description: No permission to view tasks
 *       404:
 *         description: Column not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:columnId/tasks',
    ensureAuth,
    tasksController.getColumnTasksController
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task details
 *     description: Get detailed information about a task
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid task ID
 *       403:
 *         description: No permission to view task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:taskId', ensureAuth, tasksController.getTaskDetailsController);

/**
 * @swagger
 * /tasks/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     description: Update task details (admin/owner only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid data
 *       403:
 *         description: No permission to update task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.patch('/:taskId', ensureAuth, tasksController.updateTaskController);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     description: Delete a task and its associated data (admin/owner only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       format: objectId
 *                     boardId:
 *                       type: string
 *                       format: objectId
 *                     deletedComments:
 *                       type: integer
 *                     deletedAttachments:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid task ID
 *       403:
 *         description: No permission to delete task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:taskId', ensureAuth, tasksController.deleteTaskController);

/**
 * @swagger
 * /tasks/{taskId}/move:
 *   patch:
 *     tags: [Tasks]
 *     summary: Move a task
 *     description: Move task to another column or reorder within same column
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveTaskInput'
 *     responses:
 *       200:
 *         description: Task moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       format: objectId
 *                     previousColumnId:
 *                       type: string
 *                       format: objectId
 *                     newColumnId:
 *                       type: string
 *                       format: objectId
 *                     newOrder:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid position
 *       403:
 *         description: No permission to move task
 *       404:
 *         description: Task or column not found
 *       500:
 *         description: Server error
 */
router.patch('/:taskId/move', ensureAuth, tasksController.moveTaskController);

/**
 * @swagger
 * /tasks/{taskId}/assign:
 *   post:
 *     tags: [Tasks]
 *     summary: Assign user to task
 *     description: Assign a board member to a task
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTaskInput'
 *     responses:
 *       200:
 *         description: User assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       format: objectId
 *                     assignedUserId:
 *                       type: string
 *                       format: objectId
 *                     assignerId:
 *                       type: string
 *                       format: objectId
 *                     currentAssignees:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or user not in board
 *       403:
 *         description: No permission to assign users
 *       404:
 *         description: Task not found
 *       409:
 *         description: User already assigned
 *       500:
 *         description: Server error
 */
router.post(
    '/:taskId/assign',
    ensureAuth,
    tasksController.assignTaskController
);

/**
 * @swagger
 * /tasks/{taskId}/assign/{userId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Remove user assignment
 *     description: Remove a user from task assignments (admin/owner or self-removal only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Task ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: User ID to remove
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       format: objectId
 *                     removedUserId:
 *                       type: string
 *                       format: objectId
 *                     removedBy:
 *                       type: string
 *                       format: objectId
 *                     remainingAssignees:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid IDs
 *       403:
 *         description: No permission to remove assignment
 *       404:
 *         description: Task not found or user not assigned
 *       500:
 *         description: Server error
 */
router.delete(
    '/:taskId/assign/:userId',
    ensureAuth,
    tasksController.removeAssignmentController
);

module.exports = router;
