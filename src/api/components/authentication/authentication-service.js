const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check if login attempts for email has reached the limit
 * @param {string} email - Email
 * @returns {boolean} Returns true if attempts exists and reached the limit (5)
 */
async function loginAttemptsReachedLimit(email) {
  const loginAttempt =
    await authenticationRepository.getLoginAttemptByEmail(email);
  return loginAttempt && loginAttempt.attempts >= 5;
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  return null;
}

/**
 * Increment the login attempt for email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function incrementLoginAttempt(email) {
  return authenticationRepository.createOrUpdateLoginAttempt(email);
}

/**
 * Reset the login attempt for email in 30 minutes
 * @param {string} email - Email
 * @returns {Promise}
 */
async function attemptLimitReset(email) {
  // Give a time limit of 30 minutes before resetting the login attempts
  const resetOn = new Date();
  resetOn.setMinutes(resetOn.getMinutes() + 30);

  // Updating the time limit
  return authenticationRepository.createOrUpdateTimeLimit(email, resetOn);
}

/**
 * Reset the login attempt instantly
 * @param {string} email - Email
 * @returns {Promise}
 */
async function resetLoginAttempt(email) {
  return authenticationRepository.resetLoginAttempt(email);
}

/**
 * Checking if the reset time exist and has passed for the email
 * @param {string} email - Email
 * @returns {boolean} Returns true if reset time exists and has passed
 */
async function timeLimitExistAndPassed(email) {
  const resetInfo = await authenticationRepository.getResetTime(email);

  // Checking if resetInfo is null
  if (!resetInfo) {
    return false;
  }

  const resetOn = resetInfo.resetOn;
  const currentDate = new Date();

  if (resetOn && resetOn <= currentDate) {
    // Deleting the datetime of attempt reset execution when the current 
    // datetime has passed resetOn
    const deleteTimeLimit = authenticationRepository.deleteTimeLimit(email);
    return true;
  }

  return false;
}

module.exports = {
  loginAttemptsReachedLimit,
  checkLoginCredentials,
  incrementLoginAttempt,
  attemptLimitReset,
  resetLoginAttempt,
  timeLimitExistAndPassed,
};
