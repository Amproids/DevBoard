module.exports = mongoose => {
    const attachmentSchema = mongoose.Schema(
        {
            filename: {
                type: String,
                required: true
            },
            path: {
                type: String,
                required: true
            },
            mimeType: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            },
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            task: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'tasks'
            },
            comment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'comments'
            }
        },
        {
            timestamps: true
        }
    );

    const Attachments = mongoose.model('attachments', attachmentSchema);
    return Attachments;
};
