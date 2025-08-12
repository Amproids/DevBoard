const passport = require('passport');
const createError = require('http-errors');
const authController = require('../controllers/auth');
const router = require('express').Router();
const jwt = require('../config/jwt');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Authentication]
 *     summary: Initiate Google OAuth flow
 *     description: Redirects to Google OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&client_id=YOUR_CLIENT_ID
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: Google OAuth callback
 *     description: Callback endpoint for Google OAuth flow (handled automatically)
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: OAuth state parameter
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: http://localhost:3000/dashboard?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.generateToken(req.user);
        const frontendUrl = process.env.FRONTEND_URL;
        res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    }
);

/**
 * @swagger
 * /auth/github:
 *   get:
 *     tags: [Authentication]
 *     summary: Initiate GitHub OAuth flow
 *     description: Redirects to GitHub OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: https://github.com/login/oauth/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fauth%2Fgithub%2Fcallback&scope=user%3Aemail&client_id=YOUR_CLIENT_ID
 */
router.get(
    '/github',
    passport.authenticate('github', {
        scope: ['user:email']
    })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: GitHub OAuth callback
 *     description: Callback endpoint for GitHub OAuth flow (handled automatically)
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: OAuth state parameter
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: http://localhost:3000/dashboard?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.generateToken(req.user);
        const frontendUrl = process.env.FRONTEND_URL;
        res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    }
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags: [Authentication]
 *     summary: Logout current user
 *     description: Invalidates the current session and clears cookies
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Successfully logged out. Please remove JWT token from client.'
 *       500:
 *         description: Server error during logout
 */
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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email and password
 *     description: Authenticate user with email and password credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/login', authController.loginController);

module.exports = router;
