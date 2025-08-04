module.exports = mongoose => {
    const taskSchema = mongoose.Schema(
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            column: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'columns',
                required: true
            },
            board: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'boards',
                required: true
            },
            assignees: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users'
                }
            ],
            dueDate: {
                type: Date
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            },
            tags: [
                {
                    type: String
                }
            ],
            comments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'comments'
                }
            ],
            createdBy: {
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

    const Tasks = mongoose.model('tasks', taskSchema);
    return Tasks;
};
