const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
     // Checking if time limit for reaching the failed attempts limit exists and has passed
     const timeLimitHasPassed = await authenticationServices.timeLimitExistAndPassed(email)

     if(timeLimitHasPassed){
      // Resetting the attempts when time limit has passed
      const successReset = await authenticationServices.resetLoginAttempt(email);
     }

     // Check if login attempts has reached limit
     const attemptsLimitReached = await authenticationServices.loginAttemptsReachedLimit(email);

     // Throw error responder when reacing the login attempts limit 
     if(attemptsLimitReached){
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts'
      );
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      const addAttemp = await authenticationServices.incrementLoginAttempt(email);
      const attemptsLimitReachedFinal = await authenticationServices.loginAttemptsReachedLimit(email);
      // Applying time limit of 30 minutes and reset the attempts after
      if (attemptsLimitReachedFinal){
        const counterLimitReset = authenticationServices.attemptLimitReset(email);
      }
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    } else {
      // Resetting the attempts when login is successful
      const successReset = authenticationServices.resetLoginAttempt(email);
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
