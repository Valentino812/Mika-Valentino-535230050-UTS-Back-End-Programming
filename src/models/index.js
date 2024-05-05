const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const loginAttemptSchema = require('./loginAttempt-schema');
const failedAttemptTimeSchema = require('./failedAttemptTime-schema');

// Banking
const bankingAccountInfoSchema = require('./bankingAccountInfo-schema');
const bankingTransactionSchema = require('./bankingTransactions-schema');
const bankingAccountBalanceSchema = require('./bankingAccountBalance-schema');

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

// Banking
const BankingAccountInfos = mongoose.model('bankingAccountInfos', mongoose.Schema(bankingAccountInfoSchema));
const BankingTransaction = mongoose.model('bankingTransactions', mongoose.Schema(bankingTransactionSchema));
const BankingAccountBalance = mongoose.model('bankingAccountBalance', mongoose.Schema(bankingAccountBalanceSchema));

module.exports = {
  mongoose,
  User,
  LoginAttempt,
  FailedAttemptTime,
  BankingAccountInfos,
  BankingTransaction,
  BankingAccountBalance,
};
