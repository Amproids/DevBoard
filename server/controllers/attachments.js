const createError = require('http-errors');
const attachmentsService = require('../services/attachments');
const attachmentsValidator = require('../validators/attachments');
const fs = require('fs');
const path = require('path');

const uploadAttachmentController = async (req, res, next) => {
    try {
        const { error: taskIdError } = attachmentsValidator.validateTaskId(
            req.params.taskId
        );
        if (taskIdError) {
            throw createError(
                400,
                `Invalid task ID: ${taskIdError.details[0].message}`
            );
        }

        const { error: fileError } = attachmentsValidator.validateFileUpload(
            req.file
        );
        if (fileError) {
            throw createError(400, fileError.details[0].message);
        }

        const attachment = await attachmentsService.uploadAttachmentService(
            req.params.taskId,
            req.file,
            req.user.id
        );

        res.status(201).json({
            success: true,
            data: attachment,
            message: 'File uploaded successfully'
        });
    } catch (err) {
        console.error('Error in uploadAttachmentController:', err.message);
        next(err);
    }
};

const listAttachmentsController = async (req, res, next) => {
    try {
        const { error } = attachmentsValidator.validateListAttachmentsInput({
            taskId: req.params.taskId
        });

        if (error) {
            throw createError(
                400,
                `Invalid task ID: ${error.details[0].message}`
            );
        }

        const attachments = await attachmentsService.listAttachmentsService(
            req.params.taskId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: attachments,
            message: 'Attachments retrieved successfully'
        });
    } catch (err) {
        console.error('Error in listAttachmentsController:', err.message);
        next(err);
    }
};

const deleteAttachmentController = async (req, res, next) => {
    try {
        const { error } = attachmentsValidator.validateAttachmentId(
            req.params.attachmentId
        );
        if (error) {
            throw createError(
                400,
                `Invalid attachment ID: ${error.details[0].message}`
            );
        }

        const result = await attachmentsService.deleteAttachmentService(
            req.params.attachmentId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Attachment deleted successfully'
        });
    } catch (err) {
        console.error('Error in deleteAttachmentController:', err.message);
        next(err);
    }
};

const downloadAttachmentController = async (req, res, next) => {
    try {
        const { error } = attachmentsValidator.validateAttachmentId(
            req.params.attachmentId
        );
        if (error) {
            throw createError(
                400,
                `Invalid attachment ID: ${error.details[0].message}`
            );
        }

        const attachment =
            await attachmentsService.getAttachmentForDownloadService(
                req.params.attachmentId,
                req.user.id
            );

        if (!fs.existsSync(attachment.path)) {
            throw createError(404, 'File not found on server');
        }

        res.set({
            'Content-Type': attachment.mimeType,
            'Content-Disposition': `attachment; filename="${attachment.filename}"`,
            'Content-Length': attachment.size
        });

        const fileStream = fs.createReadStream(attachment.path);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Error in downloadAttachmentController:', err.message);
        next(err);
    }
};

module.exports = {
    uploadAttachmentController,
    listAttachmentsController,
    deleteAttachmentController,
    downloadAttachmentController
};
