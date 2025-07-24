module.exports = mongoose => {
    const boardSchema = mongoose.Schema(
        {
            name: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            members: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'users'
                    },
                    role: {
                        type: String,
                        enum: ['admin', 'editor', 'viewer'],
                        default: 'editor'
                    }
                }
            ],
            columns: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'columns'
                }
            ],
            isFavorite: {
                type: Boolean,
                default: false
            },
            tags: [
                {
                    type: String
                }
            ],
            lockedColumns: {
                type: Boolean,
                default: false
            }
        },
        {
            timestamps: true
        }
    );

    const Boards = mongoose.model('boards', boardSchema);
    return Boards;
};
