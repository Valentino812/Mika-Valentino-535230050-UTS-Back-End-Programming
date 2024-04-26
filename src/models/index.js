const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const loginAttemptSchema = require('./loginAttempt-schema');
const failedAttemptTimeSchema = require('./failedAttemptTime-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const LoginAttempt = mongoose.model('logAttempt', mongoose.Schema(loginAttemptSchema));
const FailedAttemptTime = mongoose.model('failetAttemptTime', mongoose.Schema(failedAttemptTimeSchema));

module.exports = {
  mongoose,
  User,
  LoginAttempt,
  FailedAttemptTime,
};
