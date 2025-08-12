const createError = require('http-errors');
const Tasks = require('../models').tasks;
const Attachments = require('../models').attachments;
const mongoose = require('mongoose');
const fs = require('fs');

const uploadAttachmentService = async (taskId, file, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) {
            throw createError(404, 'Task not found');
        }

        const hasAccess =
            task.column.board.owner.equals(userId) ||
            task.column.board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(
                403,
                'No permission to upload files to this task'
            );
        }

        const newAttachment = new Attachments({
            filename: file.originalname,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            uploadedBy: userId,
            task: taskId
        });

        const savedAttachment = await newAttachment.save({ session });

        task.attachments.push(savedAttachment._id);
        await task.save({ session });

        await session.commitTransaction();

        return savedAttachment;
    } catch (err) {
        await session.abortTransaction();

        if (file && file.path) {
            const fs = require('fs');
            fs.unlink(file.path, () => {});
        }

        console.error('Error in uploadAttachmentService:', err.message);

        if (err.name === 'ValidationError') {
            throw createError(400, `Invalid attachment data: ${err.message}`);
        } else if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const listAttachmentsService = async (taskId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Tasks.findById(taskId)
            .populate({
                path: 'column',
                populate: {
                    path: 'board',
                    select: 'owner members'
                }
            })
            .session(session);

        if (!task) {
            throw createError(404, 'Task not found');
        }

        const hasAccess =
            task.column.board.owner.equals(userId) ||
            task.column.board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(
                403,
                'No permission to view attachments for this task'
            );
        }

        const attachments = await Attachments.find({ task: taskId })
            .populate('uploadedBy', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .session(session);

        await session.commitTransaction();

        return attachments;
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in listAttachmentsService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const deleteAttachmentService = async (attachmentId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const attachment = await Attachments.findById(attachmentId)
            .populate({
                path: 'task',
                populate: {
                    path: 'column',
                    populate: {
                        path: 'board',
                        select: 'owner members'
                    }
                }
            })
            .session(session);

        if (!attachment) {
            throw createError(404, 'Attachment not found');
        }

        const board = attachment.task.column.board;
        const isOwnerOrAdmin =
            board.owner.equals(userId) ||
            board.members.some(
                m => m.user.equals(userId) && m.role === 'admin'
            ) ||
            attachment.uploadedBy.equals(userId);

        if (!isOwnerOrAdmin) {
            throw createError(403, 'No permission to delete this attachment');
        }

        await Tasks.updateOne(
            { _id: attachment.task._id },
            { $pull: { attachments: attachmentId } }
        ).session(session);

        await Attachments.deleteOne({ _id: attachmentId }).session(session);

        let fileDeleted = false;
        if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
            fileDeleted = true;
        }

        await session.commitTransaction();

        return {
            attachmentId: attachment._id,
            taskId: attachment.task._id,
            deletedFile: fileDeleted
        };
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in deleteAttachmentService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

const getAttachmentForDownloadService = async (attachmentId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const attachment = await Attachments.findById(attachmentId)
            .populate({
                path: 'task',
                populate: {
                    path: 'column',
                    populate: {
                        path: 'board',
                        select: 'owner members'
                    }
                }
            })
            .session(session);

        if (!attachment) {
            throw createError(404, 'Attachment not found');
        }

        const board = attachment.task.column.board;
        const hasAccess =
            board.owner.equals(userId) ||
            board.members.some(m => m.user.equals(userId));

        if (!hasAccess) {
            throw createError(403, 'No permission to download this attachment');
        }

        await session.commitTransaction();
        return attachment;
    } catch (err) {
        await session.abortTransaction();
        console.error('Error in getAttachmentForDownloadService:', err.message);

        if (err.name === 'CastError') {
            throw createError(400, 'Invalid ID format');
        }
        throw err;
    } finally {
        session.endSession();
    }
};

module.exports = {
    uploadAttachmentService,
    listAttachmentsService,
    deleteAttachmentService,
    getAttachmentForDownloadService
};
