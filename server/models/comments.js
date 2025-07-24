module.exports = mongoose => {
    const commentSchema = mongoose.Schema(
        {
            content: {
                type: String,
                required: true
            },
            task: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'tasks',
                required: true
            },
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            attachments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'attachments'
                }
            ]
        },
        {
            timestamps: true
        }
    );

    const Comments = mongoose.model('comments', commentSchema);
    return Comments;
};
