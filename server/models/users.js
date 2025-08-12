const bcrypt = require('bcryptjs');

module.exports = mongoose => {
    const userSchema = mongoose.Schema(
        {
            firstName: {
                type: String,
                required: [true, 'First name is required']
            },
            lastName: {
                type: String,
                required: [true, 'Last name is required']
            },
            email: {
                type: String,
                required: [true, 'Email is required'],
                unique: true,
                lowercase: true,
                trim: true,
                match: [
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    'Please fill a valid email address'
                ]
            },
            password: {
                type: String,
                minlength: [6, 'Password must be at least 6 characters'],
                select: false
            },
            githubId: {
                type: String,
                unique: true,
                sparse: true
            },
            username: {
                type: String,
                unique: true,
                sparse: true
            },
            googleId: {
                type: String,
                unique: true,
                sparse: true
            },
            displayName: {
                type: String,
                required: true
            },
            avatar: {
                type: String
            },
            phoneNumber: {
                type: String
            }
        },
        {
            timestamps: true
        }
    );

    userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();

        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            return next();
        } catch (err) {
            return next(err);
        }
    });

    userSchema.methods.comparePassword = async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    const Users = mongoose.model('users', userSchema);
    return Users;
};
