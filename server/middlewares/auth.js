const jwt = require('../config/jwt');
const createError = require('http-errors');

module.exports = {
    // Verify both session (OAuth) and JWT
    ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verifyToken(token);
                req.user = decoded;
                return next();
            } catch (err) {
                console.error('JWT verification error:', err);
            }
        }

        if (req.accepts('json')) {
            return res
                .status(401)
                .json({ success: false, message: 'Unauthorized' });
        }
        res.redirect('/login');
    },

    // For guest routes (opposite of ensureAuth)
    ensureGuest: function (req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/dashboard');
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                jwt.verifyToken(token);
                return res.redirect('/dashboard');
            } catch (err) {}
        }

        return next();
    },

    // JWT-only middleware (for APIs)
    authenticateJWT: function (req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verifyToken(token);
                req.user = decoded;
                return next();
            } catch (err) {
                return next(createError(403, 'Invalid or expired token'));
            }
        }
        return next(createError(401, 'Authorization token required'));
    }
};
