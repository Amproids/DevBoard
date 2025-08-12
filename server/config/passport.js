const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('../models');
const Users = db.users;

module.exports = function (passport) {
    // Google Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/auth/google/callback`,
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    let user = await Users.findOne({ email });

                    if (user) {
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user = await user.save();
                        }
                        return done(null, user);
                    }

                    user = await Users.findOne({ googleId: profile.id });
                    if (user) {
                        return done(null, user);
                    }

                    const newUser = new Users({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        firstName: profile.name?.givenName || '',
                        lastName: profile.name?.familyName || '',
                        email: email,
                        avatar: profile.photos?.[0]?.value || null
                    });

                    user = await newUser.save();
                    done(null, user);
                } catch (err) {
                    console.error('Google Strategy Error:', err);
                    done(err, null);
                }
            }
        )
    );

    // GitHub Strategy
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/auth/github/callback`,
                scope: ['user:email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(
                        'GitHub Profile:',
                        JSON.stringify(profile, null, 2)
                    ); // Debug log

                    const email = profile.emails?.[0]?.value;

                    // Handle missing email
                    if (!email) {
                        return done(
                            new Error(
                                'No email provided by GitHub. Please make sure your GitHub account has a public email address.'
                            ),
                            null
                        );
                    }

                    let user = await Users.findOne({ email });

                    if (user) {
                        if (!user.githubId) {
                            user.githubId = profile.id;
                            user = await user.save();
                        }
                        return done(null, user);
                    }

                    user = await Users.findOne({ githubId: profile.id });
                    if (user) {
                        return done(null, user);
                    }

                    // Parse GitHub name - GitHub often provides full name in displayName
                    let firstName = '';
                    let lastName = '';

                    if (profile.displayName) {
                        const nameParts = profile.displayName.trim().split(' ');
                        firstName = nameParts[0] || '';
                        lastName = nameParts.slice(1).join(' ') || '';
                    }

                    // Fallback if no display name
                    if (!firstName) {
                        firstName = profile.username || 'GitHub';
                        lastName = 'User';
                    }

                    const newUser = new Users({
                        githubId: profile.id,
                        displayName: profile.displayName || profile.username,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        avatar: profile.photos?.[0]?.value || null,
                        username: profile.username
                    });

                    user = await newUser.save();
                    done(null, user);
                } catch (err) {
                    console.error('GitHub Strategy Error:', err);
                    console.error('Profile data:', profile);
                    done(err, null);
                }
            }
        )
    );

    // Serialize/Deserialize User (Fixed)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Users.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
