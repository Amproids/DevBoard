const dbConfig = require('../config/db.config.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.activities = require('./activities.js')(mongoose);
db.attachments = require('./attachments.js')(mongoose);
db.boards = require('./boards.js')(mongoose);
db.columns = require('./columns.js')(mongoose);
db.comments = require('./comments.js')(mongoose);
db.invitations = require('./invitations.js')(mongoose);
db.tasks = require('./tasks.js')(mongoose);
db.users = require('./users.js')(mongoose);

module.exports = db;
