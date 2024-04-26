const { User, LoginAttempt, FailedAttemptTime } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Get the login attempt of email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getLoginAttemptByEmail(email) {
  return LoginAttempt.findOne({ email });
}

/**
 * Create or update and increment the login attempt for email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function createOrUpdateLoginAttempt(email) {
  return LoginAttempt.findOneAndUpdate(
    { email },
    { $inc: { attempts: 1 }, $setOnInsert: { email } },
    { upsert: true, new: true }
  );
}

/**
 * Reset the login attempt for email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function resetLoginAttempt(email) {
  return LoginAttempt.findOneAndUpdate({ email }, { $set: { attempts: 0 } });
}

/**
 * Get the reset attempt datetime for the email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getResetTime(email) {
  return FailedAttemptTime.findOne({ email });
}

/**
 * Create or update the datetime of the reset attempt execution 
 * @param {string} email - Email
 * @param {date} resetOn
 * @returns {Promise}
 */
async function createOrUpdateTimeLimit(email, resetOn) {
  return FailedAttemptTime.findOneAndUpdate(
    { email },
    { $set: { resetOn } },
    { upsert: true, new: true }
  );
}

/**
 * Delete the reset attempt datetime 
 * @param {string} email - Email
 * @returns {Promise}
 */
async function deleteTimeLimit(email) {
  return FailedAttemptTime.deleteOne({ email });
}

module.exports = {
  getUserByEmail,
  getLoginAttemptByEmail,
  createOrUpdateLoginAttempt,
  resetLoginAttempt,
  getResetTime,
  createOrUpdateTimeLimit,
  deleteTimeLimit,
};
