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
                callbackURL: '/auth/google/callback',
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log(profile);
                const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name?.givenName || '',
                    lastName: profile.name?.familyName || '',
                    email: profile.emails?.[0]?.value || null,
                    avatar: profile.photos?.[0]?.value || null
                };
                try {
                    let user = await Users.findOne({ googleId: profile.id });
                    if (user) {
                        done(null, user);
                    } else {
                        user = await Users.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.log(err);
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
