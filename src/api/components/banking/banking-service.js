const bankingRepository = require('./banking-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Create a new account
 * @param {string} nama_lengkap
 * @param {string} tempat_lahir
 * @param {string} tanggal_lahir
 * @param {string} jenis_kelamin
 * @param {string} alamat
 * @param {string} no_telepon
 * @param {string} email
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
async function createAccount(
  nama_lengkap,
  tempat_lahir,
  tanggal_lahir,
  jenis_kelamin,
  alamat,
  no_telepon,
  email,
  username,
  password
) {
  // Hash password
  const hashedPassword = hashPassword(password);
  try {
    await bankingRepository.createAccount(
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email,
      username,
      hashedPassword,
    );
    // await bankingRepository.createAccountBalance(username);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update account information
 * @param {string} username
 * @param {string} nama_lengkap
 * @param {string} tempat_lahir
 * @param {Date} tanggal_lahir
 * @param {string} jenis_kelamin
 * @param {string} alamat
 * @param {string} no_telepon
 * @param {string} email
 * @returns {boolean}
 */
async function updateAccount(
  username,
  nama_lengkap,
  tempat_lahir,
  tanggal_lahir,
  jenis_kelamin,
  alamat,
  no_telepon,
  email
) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await bankingRepository.updateAccount(
      username,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account by username
 * @param {string} username - Username
 * @returns {boolean}
 */
async function deleteAccount(username) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await bankingRepository.deleteAccount(username);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Get balance info and transaction history list for an account by spesific criteria
 * @param {string} jenis_transaksi
 * @param {string} urutan
 * @param {string} username
 * @returns {Array}
 */
async function getTransactionHistory(jenis_transaksi, urutan, username) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }
  const balance = await bankingRepository.getBalanceInfo(username);
  const transaction = await bankingRepository.getTransactionHistory(
    jenis_transaksi,
    urutan,
    username
  );

  const balanceInfo = {
    no_rekening: balance.no_rekening,
    balance: balance.balance,
  } 

  // Transaction history array
  const transactionHistory = [];
  for (let i = 0; i < transaction.length; i += 1) {
    const transactionInfo = transaction[i];
    transactionHistory.push({
      no_rekening: transactionInfo.no_rekening,
      tanggal: transactionInfo.tanggal,
      jenis_transaksi: transactionInfo.jenis_transaksi,
      berita: transactionInfo.berita,
      jumlah: transactionInfo.jumlah,
    });
  }

  const results = {
    balanceInfo,
    transactionHistory
  }
  return results;
}

/**
 * Deposit funds into a user's account
 * @param {string} username
 * @param {number} jumlah
 * @returns {boolean}
 */
async function accountDeposit(username, jumlah) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  const tanggal = new Date();

  try {
    await bankingRepository.accountDeposit(username, tanggal, jumlah);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Withdraw funds from a user's account
 * @param {string} username
 * @param {number} jumlah
 * @returns {boolean}
 */
async function accountWithdraw(username, jumlah) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  const tanggal = new Date();

  try {
    await bankingRepository.accountWithdraw(username, tanggal, jumlah);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Transfer funds from a user's account to another account
 * @param {string} username
 * @param {string} berita
 * @param {string} noRekTujuan
 * @param {number} jumlah
 * @returns {boolean}
 */
async function accountTransfer(username, berita, noRekTujuan, jumlah) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  const tanggal = new Date();

  try {
    await bankingRepository.accountTransfer(
      username,
      berita,
      noRekTujuan,
      tanggal,
      jumlah
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Change account password
 * @param {string} username - Username
 * @param {string} password - New password
 * @returns {boolean}
 */
async function changePassword(username, password) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  const changeSuccess = await bankingRepository.changePassword(
    username,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Check whether the username is already taken
 * @param {string} username
 * @returns {boolean}
 */
async function usernameTaken(username) {
  const usernameExists = await bankingRepository.getAccount(username);

  if (usernameExists) {
    return true;
  }

  return false;
}

/**
 * Check whether email and no_telepon is registered if
 * the email and no_telepon are diffrent in the current account info
 * @param {string} username
 * @param {string} email
 * @param {string} no_telepon
 * @returns {boolean}
 */
async function alreadyRegistered(username, email, no_telepon) {
  const account = await bankingRepository.getAccount(username);

  // Account found (checking if the email and phone number are same)
  if (account) {
    const currentEmail = account.email;
    const currentPhone = account.no_telepon;
    if (email === currentEmail && no_telepon === currentPhone) {
      return false;
    }
  }

  const emailExists = await bankingRepository.getAccountByEmail(email);
  const noTelpExists = await bankingRepository.getAccountByTelp(no_telepon);

  if (!emailExists && !noTelpExists) {
    return false;
  }

  return true;
}

/**
 * Get account information by username
 * @param {string} username - Username
 * @returns {Object}
 */
async function getInfo(username) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    username: account.username,
    nama_lengkap: account.nama_lengkap,
    tempat_lahir: account.tempat_lahir,
    tanggal_lahir: account.tanggal_lahir,
    jenis_kelamin: account.jenis_kelamin,
    alamat: account.alamat,
    no_telepon: account.no_telepon,
    email: account.email,
  };
}

/**
 * Get account number by username
 * @param {string} username 
 * @returns {string}
 */
async function getNoRek(username) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  const balance = await bankingRepository.getBalanceInfo(username);
  return balance.no_rekening;
}

/**
 * Get account balance
 * @param {string} username 
 * @returns {Number}
 */
async function getAccountBalance(username) {
  const account = await bankingRepository.getAccount(username);

  // Account not found
  if (!account) {
    return null;
  }

  const balance = await bankingRepository.getBalanceInfo(username);
  return balance.balance;
}

/**
 * Check if password matches the account
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(username, password) {
  const account = await bankingRepository.getAccount(username);
  return passwordMatched(password, account.password);
}

/**
 * Increase the failed login attempts the account
 * @param {string} username
 * @returns {Promise}
 */
async function addAttempts(username) {
  return bankingRepository.updateLoginAttempt(username);
}

/**
 * Get the number of failed login attempts for the account
 * @param {string} username - Username
 * @returns {number}
 */
async function getAttempts(username) {
  const account = await bankingRepository.getAccount(username);
  return account.attempts;
}

/**
 * Reset failed login attempts count for the account
 * @param {string} username
 * @returns {Promise}
 */
async function resetAttempts(username) {
  return bankingRepository.resetAttempts(username);
}

/**
 * Check if failed login attempts limit is reached for the account (The limit is 3)
 * @param {string} username 
 * @returns {boolean}
 */
async function attemptsLimitReached(username) {
  const account = await bankingRepository.getAccount(username);
  const loginAttempt = account.attempts;
  return loginAttempt && loginAttempt.attempts >= 3;
}

module.exports = {
  createAccount,
  updateAccount,
  deleteAccount,
  getTransactionHistory,
  accountDeposit,
  accountWithdraw,
  accountTransfer,
  changePassword,
  usernameTaken,
  alreadyRegistered,
  getInfo,
  getNoRek,
  getAccountBalance,
  checkPassword,
  addAttempts,
  getAttempts,
  resetAttempts,
  attemptsLimitReached,
};
