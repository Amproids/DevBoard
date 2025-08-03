const router = require('express').Router();
const columnsController = require('../controllers/columns.js');
const { ensureAuth } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Columns
 *     description: Board column management
 */

/**
 * @swagger
 * /columns/{boardId}:
 *   get:
 *     tags: [Columns]
 *     summary: Get board columns
 *     description: Retrieve all columns for a specific board
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [order, -order]
 *           default: "order"
 *         description: Sort order
 *       - in: query
 *         name: populateTasks
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to populate task details
 *     responses:
 *       200:
 *         description: List of columns
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ColumnsResponse'
 *       400:
 *         description: Invalid query parameters
 *       403:
 *         description: No permission to view columns
 *       500:
 *         description: Server error
 */
router.get('/:boardId', ensureAuth, columnsController.getColumnsController);

/**
 * @swagger
 * /columns/{boardId}:
 *   post:
 *     tags: [Columns]
 *     summary: Create a new column
 *     description: Create a new column in a board (admin/owner only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ColumnInput'
 *     responses:
 *       201:
 *         description: Column created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Column'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: No permission to create columns
 *       500:
 *         description: Server error
 */
router.post('/:boardId', ensureAuth, columnsController.createColumnController);

/**
 * @swagger
 * /columns/{columnId}:
 *   put:
 *     tags: [Columns]
 *     summary: Update a column
 *     description: Update column details or reorder tasks (admin/owner only)
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
 *             $ref: '#/components/schemas/ColumnUpdateInput'
 *     responses:
 *       200:
 *         description: Column updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Column'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid order
 *       403:
 *         description: No permission to update column
 *       404:
 *         description: Column not found
 *       409:
 *         description: Order conflict
 *       500:
 *         description: Server error
 */
router.put('/:columnId', ensureAuth, columnsController.updateColumnController);

/**
 * @swagger
 * /columns/{columnId}:
 *   delete:
 *     tags: [Columns]
 *     summary: Delete a column
 *     description: Delete a column and handle its tasks (admin/owner only)
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
 *             $ref: '#/components/schemas/ColumnDeleteInput'
 *     responses:
 *       200:
 *         description: Column deleted successfully
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
 *                     deletedColumnId:
 *                       type: string
 *                       format: objectId
 *                     actionTaken:
 *                       type: string
 *                     tasksAffected:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or missing action
 *       403:
 *         description: No permission to delete column
 *       404:
 *         description: Column not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:columnId',
    ensureAuth,
    columnsController.deleteColumnController
);

/**
 * @swagger
 * /columns/{columnId}:
 *   patch:
 *     tags: [Columns]
 *     summary: Lock/unlock a column
 *     description: Toggle column lock status (board owner only)
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
 *             $ref: '#/components/schemas/ColumnLockInput'
 *     responses:
 *       200:
 *         description: Column lock status updated
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
 *                     columnId:
 *                       type: string
 *                       format: objectId
 *                     boardId:
 *                       type: string
 *                       format: objectId
 *                     isLocked:
 *                       type: boolean
 *                     previousStatus:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: No permission to lock/unlock
 *       404:
 *         description: Column not found
 *       500:
 *         description: Server error
 */
router.patch('/:columnId', ensureAuth, columnsController.lockColumnController);

module.exports = router;
