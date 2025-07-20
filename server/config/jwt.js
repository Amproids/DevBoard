const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    generateToken: user => {
        return jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    },
    verifyToken: token => {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};
