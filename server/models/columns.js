module.exports = mongoose => {
    const columnSchema = mongoose.Schema(
        {
            name: {
                type: String,
                required: true
            },
            board: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'boards',
                required: true
            },
            tasks: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'tasks'
                }
            ],
            isLocked: {
                type: Boolean,
                default: false
            },
            order: {
                type: Number,
                required: true
            }
        },
        {
            timestamps: true
        }
    );
    const Columns = mongoose.model('columns', columnSchema);
    return Columns;
};
