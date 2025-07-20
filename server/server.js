const express = require('express');
//const cors = require('cors');
const createError = require('http-errors');
const session = require('express-session');
const db = require('./models');
const app = express();
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport')(passport);

const PORT = process.env.PORT || 5000;

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 14 * 24 * 60 * 60,
            autoRemove: 'native'
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Basic middleware
app.use(express.json());

// Test route
app.use(bodyParser.json())
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    })
    .use('/', require('./routes'))
    .use('/auth', require('./routes/auth'));

app.use((req, res, next) => {
    next(createError(404, 'Not found.'));
});

//Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

// Connection to DB
db.mongoose
    .connect(db.url)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Cannot connect to the database!', err);
        process.exit(1);
    });
