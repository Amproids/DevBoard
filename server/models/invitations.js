module.exports = mongoose => {
    const invitationSchema = mongoose.Schema(
        {
            email: {
                type: String,
                required: true,
                match: [
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    'Please fill a valid email address'
                ]
            },
            board: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'boards',
                required: true
            },
            role: {
                type: String,
                enum: ['admin', 'editor', 'viewer'],
                default: 'editor'
            },
            token: {
                type: String,
                required: true,
                unique: true
            },
            expiresAt: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            invitedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true
            }
        },
        {
            timestamps: true
        }
    );

    const Invitations = mongoose.model('invitations', invitationSchema);
    return Invitations;
};
