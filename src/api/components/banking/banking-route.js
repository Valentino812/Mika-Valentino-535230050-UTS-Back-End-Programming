const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const bankingControllers = require('./banking-controller');
const bankingValidator = require('./banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  // Membuat akun baru
  route.post(
    '/account',
    authenticationMiddleware,
    celebrate(bankingValidator.createAccount),
    bankingControllers.createAccount
  );

  // Mendapatkan informasi akun
  route.get(
    '/account',
    authenticationMiddleware,
    celebrate(bankingValidator.getInfo),
    bankingControllers.getInfo
  );

  // Mengubah informasi akun
  route.put(
    '/account',
    authenticationMiddleware,
    celebrate(bankingValidator.updateAccount),
    bankingControllers.updateAccount
  );

  // Menghapus akun
  route.delete(
    '/account',
    authenticationMiddleware,
    celebrate(bankingValidator.deleteAccount),
    bankingControllers.deleteAccount
  );

  // Mendapatkan informasi saldo dan histori transaksi akun
  route.get(
    '/account/transaction',
    authenticationMiddleware,
    celebrate(bankingValidator.transactionHistory),
    bankingControllers.transactionHistory
  );

  // Memasukan uang pada rekening (deposit uang cash ke mesin ATM)
  route.put(
    '/account/deposit',
    authenticationMiddleware,
    celebrate(bankingValidator.accountDeposit),
    bankingControllers.accountDeposit
  );

  // Mengambil uang dari rekening (withdraw uang cash dari mesin ATM)
  route.put(
    '/account/withdraw',
    authenticationMiddleware,
    celebrate(bankingValidator.accountWithdraw),
    bankingControllers.accountWithdraw
  );

  // Melakukan transfer ke rekening lain
  route.put(
    '/account/transfer',
    authenticationMiddleware,
    celebrate(bankingValidator.accountTransfer),
    bankingControllers.accountTransfer
  );

  // Mengganti password akun
  route.post(
    '/account/change-password',
    authenticationMiddleware,
    celebrate(bankingValidator.changePassword),
    bankingControllers.changePassword
  );
};
