const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const db = require('../models');
const Users = db.users;

module.exports = function (passport) {
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

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        Users.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err, null));
        try {
            const user = await Users.findById(id);
            return user;
        } catch (err) {
            done(err, null);
        }
        Users.findById(id, (err, user) => done(err, user));
    });
};
