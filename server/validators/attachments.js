const Joi = require('joi');

const validateTaskId = taskId => {
    return Joi.string().hex().length(24).required().validate(taskId);
};

const validateFileUpload = file => {
    if (!file) {
        return { error: { details: [{ message: 'File is required' }] } };
    }
    return { value: file };
};

const validateListAttachmentsInput = data => {
    const schema = Joi.object({
        taskId: Joi.string().hex().length(24).required()
    });
    return schema.validate(data);
};

const validateAttachmentId = attachmentId => {
    return Joi.string().hex().length(24).required().validate(attachmentId);
};

module.exports = {
    validateTaskId,
    validateFileUpload,
    validateListAttachmentsInput,
    validateAttachmentId
};
