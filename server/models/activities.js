module.exports = mongoose => {
    const activitySchema = mongoose.Schema(
        {
            action: {
                type: String,
                required: true
            },
            entityType: {
                type: String,
                enum: ['board', 'column', 'task', 'comment', 'attachment'],
                required: true
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            board: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'boards',
                required: true
            },
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            details: {
                type: Object
            }
        },
        {
            timestamps: true
        }
    );

    const Activities = mongoose.model('activities', activitySchema);
    return Activities;
};
