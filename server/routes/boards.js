const router = require('express').Router();
const boardController = require('../controllers/boards.js');
const { ensureAuth } = require('../middlewares/auth');

/**
 * @swagger
 * /boards:
 *   get:
 *     tags: [Boards]
 *     summary: Get user's boards
 *     description: |
 *       Returns a list of boards filtered and sorted according to query parameters.
 *       Includes populated data for owner, members, columns, and tasks.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, favorites, owned]
 *           default: "all"
 *         description: Filter boards (all, favorites, or owned by user)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, createdAt, -createdAt]
 *           default: "-createdAt"
 *         description: Sort field and direction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for board name/description
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBoardsResponse'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized (missing/invalid token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetBoardsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FullBoard'
 *         meta:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               example: 3
 *             filters:
 *               type: object
 *               properties:
 *                 applied:
 *                   type: string
 *                   example: "all"
 *                 available:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["all", "favorites", "owned"]
 *             sort:
 *               type: object
 *               properties:
 *                 applied:
 *                   type: string
 *                   example: "-createdAt"
 *                 available:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["name", "-name", "createdAt", "-createdAt"]
 *         message:
 *           type: string
 *           example: "Boards retrieved successfully"
 *
 *     FullBoard:
 *       allOf:
 *         - $ref: '#/components/schemas/Board'
 *         - type: object
 *           properties:
 *             columns:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BoardColumn'
 *
 *     BoardColumn:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         name:
 *           type: string
 *         order:
 *           type: integer
 *         isLocked:
 *           type: boolean
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BoardTask'
 *
 *     BoardTask:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         assignees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserRef'
 */
router.get('/', ensureAuth, boardController.getBoardsController);

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     tags: [Boards]
 *     summary: Get a board by ID
 *     description: |
 *       Returns a specific board with populated columns and tasks.
 *       User must be owner or member of the board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FullBoard'
 *                 message:
 *                   type: string
 *                   example: "Board retrieved successfully"
 *       400:
 *         description: Invalid board ID format
 *       403:
 *         description: No permission to view this board
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.get('/:id', ensureAuth, boardController.getBoardController);

/**
 * @swagger
 * /boards:
 *   post:
 *     tags: [Boards]
 *     summary: Create a new board
 *     description: |
 *       Creates a new board. The authenticated user automatically becomes the owner and admin.
 *       Members can be optionally added during creation.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardInput'
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: Validation error (missing/invalid fields or non-existent users)
 *       409:
 *         description: Board name already exists for this user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBoardInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Project Roadmap"
 *           minLength: 3
 *           maxLength: 50
 *         description:
 *           type: string
 *           example: "Q2 2023 Product Development"
 *           maxLength: 200
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 format: objectId
 *                 example: "507f1f77bcf86cd799439011"
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 default: "member"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             example: ["development", "urgent"]
 *         lockedColumns:
 *           type: boolean
 *           default: false
 *
 *     BoardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Board'
 *         message:
 *           type: string
 *           example: "Board created successfully"
 *
 *     Board:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/UserRef'
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BoardMember'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         lockedColumns:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     UserRef:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *
 *     BoardMember:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserRef'
 *         role:
 *           type: string
 *           enum: [admin, member]
 */
router.post('/', ensureAuth, boardController.createBoardController);

/**
 * @swagger
 * /boards/{id}/column-order:
 *   put:
 *     tags: [Boards]
 *     summary: Update column order for a board
 *     description: |
 *       Updates the order of columns in a board by reordering the columns array.
 *       Only board members with appropriate permissions can reorder columns.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Board ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columnIds
 *             properties:
 *               columnIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Array of column IDs in the new order
 *                 example: ["col1_id", "col2_id", "col3_id"]
 *     responses:
 *       200:
 *         description: Column order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Column order updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/FullBoard'
 *       400:
 *         description: Invalid column IDs or board ID format
 *       403:
 *         description: No permission to modify this board
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.put('/:id/column-order', ensureAuth, boardController.updateColumnOrderController);

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     tags: [Boards]
 *     summary: Update a board
 *     description: |
 *       Updates board details. Only the owner or admin members can modify the board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBoardInput'
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: Invalid updates or validation error
 *       401:
 *         description: Unauthorized (non-admin user)
 *       404:
 *         description: Board not found or no permission
 *       409:
 *         description: Board name conflict
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBoardInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Roadmap"
 *           minLength: 3
 *           maxLength: 50
 *         description:
 *           type: string
 *           example: "Updated Q3 2023 Plan"
 *           maxLength: 200
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MemberInput'
 *         isFavorite:
 *           type: boolean
 *           example: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["updated", "priority"]
 *         lockedColumns:
 *           type: boolean
 *           example: true
 *
 *     MemberInput:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           format: objectId
 *           example: "507f1f77bcf86cd799439011"
 *         role:
 *           type: string
 *           enum: [admin, member]
 */
router.put('/:id', ensureAuth, boardController.updateBoardController);

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     tags: [Boards]
 *     summary: Delete a board
 *     description: |
 *       Permanently deletes a board and its associated columns/invitations.
 *       Only the owner can delete the board.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board deleted successfully"
 *                 deletedBoard:
 *                   $ref: '#/components/schemas/Board'
 *       400:
 *         description: Invalid board ID format
 *       401:
 *         description: Unauthorized (non-owner user)
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', ensureAuth, boardController.deleteBoardController);

module.exports = router;