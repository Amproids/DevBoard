module.exports = mongoose => {
    const Users = mongoose.model(
        'users',
        mongoose.Schema({
            firstName: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                unique: true,
                required: true
            },
            password: {
                type: String
            },
            googleId: {
                type: String,
                required: true
            },
            displayName: {
                type: String,
                required: true
            }
        })
    );
    return Users;
};
