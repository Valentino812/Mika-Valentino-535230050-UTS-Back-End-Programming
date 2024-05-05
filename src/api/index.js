const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const banking = require('./components/banking/banking-route')

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  banking(app);

  return app;
};
