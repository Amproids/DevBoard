const router = require('express').Router();
const attachmentsController = require('../controllers/attachments');
const { ensureAuth } = require('../middlewares/auth');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   - name: Attachments
 *     description: File attachments management
 */

/**
 * @swagger
 * /tasks/{taskId}/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload file to task
 *     description: Upload a file attachment to a specific task
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Invalid file or task ID
 *       403:
 *         description: No permission to upload files to this task
 *       404:
 *         description: Task not found
 *       413:
 *         description: File too large
 *       500:
 *         description: Server error
 */
router.post(
    '/:taskId/attachments',
    ensureAuth,
    upload.single('file'),
    attachmentsController.uploadAttachmentController
);

/**
 * @swagger
 * /tasks/{taskId}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: List task attachments
 *     description: Get all attachments for a specific task
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
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Invalid task ID
 *       403:
 *         description: No permission to view task attachments
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:taskId/attachments',
    ensureAuth,
    attachmentsController.listAttachmentsController
);

/**
 * @swagger
 * /attachments/{attachmentId}:
 *   get:
 *     tags: [Attachments]
 *     summary: Download an attachment
 *     description: Download a file attachment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File attachment
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid attachment ID
 *       403:
 *         description: No permission to download this attachment
 *       404:
 *         description: Attachment not found or file missing
 *       500:
 *         description: Server error
 */
router.get(
    '/:attachmentId',
    ensureAuth,
    attachmentsController.downloadAttachmentController
);

/**
 * @swagger
 * /attachments/{attachmentId}:
 *   delete:
 *     tags: [Attachments]
 *     summary: Delete an attachment
 *     description: Delete a file attachment (owner or admin/board owner only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
 *                     attachmentId:
 *                       type: string
 *                       format: objectId
 *                     taskId:
 *                       type: string
 *                       format: objectId
 *                     deletedFile:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid attachment ID
 *       403:
 *         description: No permission to delete this attachment
 *       404:
 *         description: Attachment not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:attachmentId',
    ensureAuth,
    attachmentsController.deleteAttachmentController
);

module.exports = router;
