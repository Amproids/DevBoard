const passport = require('passport');
const authController = require('../controllers/auth');
const router = require('express').Router();
const jwt = require('../config/jwt');

// Google OAuth Routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.generateToken(req.user);
        const frontendUrl = process.env.FRONTEND_URL;
        res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    }
);

// GitHub OAuth Routes
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.generateToken(req.user);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  }
);

// Logout Route
router.get('/logout', (req, res, next) => {
    const sessionId = req.sessionID;

    req.logout(function (err) {
        if (err) {
            console.error('Error during logout:', err);
            return next(createError(500, 'Logout failed'));
        }

        req.session.destroy(function (err) {
            if (err) {
                console.error('Error destroying session:', err);
                return next(createError(500, 'Session destruction failed'));
            }

            console.log(`Session ${sessionId} destroyed`);

            res.clearCookie('connect.sid');

            res.status(200).json({
                success: true,
                message:
                    'Successfully logged out. Please remove JWT token from client.'
            });
        });
    });
});

router.post('/login', authController.loginController);

module.exports = router;
