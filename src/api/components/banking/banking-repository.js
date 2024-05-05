const {
  BankingAccountInfos,
  BankingTransaction,
  BankingAccountBalance,
} = require('../../../models');

// Function to generate random numbers
function generateRandomNumber(length) {
  let randomNumber = '';

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    randomNumber += digit.toString(); // Converting numbers to string to be use as account number
  }

  return randomNumber;
}

/**
 * Create new account
 * @param {string} nama_lengkap
 * @param {string} tempat_lahir
 * @param {string} tanggal_lahir
 * @param {string} jenis_kelamin
 * @param {string} alamat
 * @param {string} no_telepon
 * @param {string} email
 * @param {string} username
 * @param {string} password
 * @returns {Promise}
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
  // Failed login attempts
  const attempts = 0;

  const no_rekening = generateRandomNumber(10);
  const balance = 0;

  // Execute both create operations
  const [accountInfoResult, accountBalanceResult] = await Promise.all([
    BankingAccountInfos.create({
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email,
      username,
      password,
      attempts,
    }),
    BankingAccountBalance.create({
      no_rekening,
      username,
      balance,
    }),
  ]);

  return { accountInfoResult, accountBalanceResult };
}

/**
 * Get account info
 * @param {string} username
 * @returns {Promise}
 */
async function getAccount(username) {
  return BankingAccountInfos.findOne({ username });
}

/**
 * Update existing account info
 * @param {string} username
 * @param {string} nama_lengkap
 * @param {string} tempat_lahir
 * @param {Date} tanggal_lahir
 * @param {string} jenis_kelamin
 * @param {string} alamat
 * @param {string} no_telepon
 * @param {string} email
 * @returns {Promise}
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
  return BankingAccountInfos.updateOne(
    {
      username,
    },
    {
      $set: {
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon,
        email,
      },
    }
  );
}

/**
 * Delete an account
 * @param {string} username
 * @returns {Promise}
 */
async function deleteAccount(username) {
  try {
    await BankingAccountInfos.deleteOne({ username });
    await BankingAccountBalance.deleteOne({ username });

    return Promise.resolve(true); // Deleting account successfull
  } catch (error) {
    return Promise.reject(error); // Failed to delete account
  }
}

/**
 * Get transaction history
 * @param {string} jenis
 * @param {string} urutan
 * @param {string} username
 * @returns {Promise}
 */
async function getTransactionHistory(jenis, urutan, username) {
  const account = await BankingAccountBalance.findOne({ username });
  const no_rekening = account.no_rekening;

  // Getting transaction list based on the transaction type
  if (jenis === 'masuk') {
    transactionList = await BankingTransaction.find({
      no_rekening,
      jenis_transaksi: jenis,
    });
  } else if (jenis === 'keluar') {
    transactionList = await BankingTransaction.find({
      no_rekening,
      jenis_transaksi: jenis,
    });
  } else {
    transactionList = await BankingTransaction.find({ no_rekening });
  }

  // Order transactions based on the order criteria
  if (urutan === 'LamaKeBaru') {
    transactionList.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (urutan === 'BaruKeLama') {
    transactionList.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  return transactionList;
}

/**
 * Deposit to account
 * @param {string} username
 * @param {Date} tanggal
 * @param {number} jumlah
 * @returns {Promise}
 */
async function accountDeposit(username, tanggal, jumlah) {
  const account = await BankingAccountBalance.findOne({ username });
  const no_rekening = account.no_rekening;
  const jenis_transaksi = 'masuk';
  const berita = 'Deposit via ATM';
  const currentBalance = account.balance;
  const newBalance = currentBalance + jumlah;
  try {
    await BankingTransaction.create({
      no_rekening,
      tanggal,
      jenis_transaksi,
      berita,
      jumlah,
    });
    await BankingAccountBalance.updateOne(
      {
        username,
      },
      {
        $set: {
          balance: newBalance,
        },
      }
    );

    return Promise.resolve(true); // Deposit sucessfull
  } catch (error) {
    return Promise.reject(error); // Failed to deposit
  }
}

/**
 * Withdraw from account
 * @param {string} username

 * @param {number} jumlah
 * @returns {Promise}
 */
async function accountWithdraw(username, tanggal, jumlah) {
  const account = await BankingAccountBalance.findOne({ username });
  const no_rekening = account.no_rekening;
  const jenis_transaksi = 'keluar';
  const berita = 'Withdraw via ATM';
  const currentBalance = account.balance;
  const newBalance = currentBalance - jumlah;
  try {
    await BankingTransaction.create({
      no_rekening,
      tanggal,
      jenis_transaksi,
      berita,
      jumlah,
    });
    await BankingAccountBalance.updateOne(
      {
        username,
      },
      {
        $set: {
          balance: newBalance,
        },
      }
    );

    return Promise.resolve(true); // Deposit sucessfull
  } catch (error) {
    return Promise.reject(error); // Failed to deposit
  }
}

/**
 * Transfer funds from one account to another
 * @param {string} username
 * @param {string} berita
 * @param {string} noRekTujuan
 * @param {Date} tanggal
 * @param {number} jumlah
 * @returns {Promise}
 */
async function accountTransfer(username, berita, noRekTujuan, tanggal, jumlah) {
  const senderAccount = await BankingAccountBalance.findOne({
    username,
  });
  const recipientAccount = await BankingAccountBalance.findOne({
    no_rekening: noRekTujuan,
  });

  const recipentUsername = recipientAccount.username;

  const senderAccountInfo = await BankingAccountInfos.findOne({ username });
  const reciptAccountInfo = await BankingAccountInfos.findOne({
    username: recipentUsername,
  });

  const senderName = senderAccountInfo.nama_lengkap;
  const reciptName = reciptAccountInfo.nama_lengkap;

  const senderAccountNumber = senderAccount.no_rekening;

  const newSenderBalance = senderAccount.balance - jumlah;
  const newRecipientBalance = recipientAccount.balance + jumlah;

  const senderTransactionNews =
    'Tranfer ke ' + reciptName + ' ' + noRekTujuan + ': ' + berita;
  const reciptTransactionNews =
    'Tranfer oleh ' + senderName + ' ' + senderAccountNumber + ': ' + berita;

  const senderJenisTransaksi = 'keluar';
  const reciptJenisTransaksi = 'masuk';

  try {
    // Updating the balance from both account
    await BankingAccountBalance.updateOne(
      { username: username },
      { balance: newSenderBalance }
    );
    await BankingAccountBalance.updateOne(
      { no_rekening: noRekTujuan },
      { balance: newRecipientBalance }
    );

    // New transaction info for sender
    await BankingTransaction.create({
      no_rekening: senderAccountNumber,
      tanggal,
      jenis_transaksi: senderJenisTransaksi,
      berita: senderTransactionNews,
      jumlah,
    });

    // New transaction info for recipent
    await BankingTransaction.create({
      no_rekening: noRekTujuan,
      tanggal,
      jenis_transaksi: reciptJenisTransaksi,
      berita: reciptTransactionNews,
      jumlah,
    });

    return Promise.resolve(true);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update account password
 * @param {string} username
 * @param {string} password
 * @returns {Promise}
 */
async function changePassword(username, password) {
  return BankingAccountInfos.updateOne({ username }, { $set: { password } });
}

/**
 * Get account information by email
 * @param {string} email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return BankingAccountInfos.findOne({ email });
}

/**
 * Get account information by phone number
 * @param {string} no_telepon
 * @returns {Promise}
 */
async function getAccountByTelp(no_telepon) {
  return BankingAccountInfos.findOne({ no_telepon });
}

/**
 * Get account balance info
 * @param {string} username
 * @returns {Promise}
 */
async function getBalanceInfo(username) {
  return BankingAccountBalance.findOne({ username });
}

/**
 * Update by incrementing the number of failed login attempts for an account
 * @param {string} username
 * @returns {Promise}
 */
async function updateLoginAttempt(username) {
  const account = await BankingAccountInfos.findOne({ username });
  const currentAttempts = account.attempts;
  const newAttempts = currentAttempts + 1;
  return await BankingAccountInfos.updateOne(
    { username },
    { attempts: newAttempts }
  );
}

/**
 * Reset failed login attempts count for the account
 * @param {string} username
 * @returns {Promise}
 */
async function resetAttempts(username) {
  return BankingAccountInfos.updateOne({ username }, { attempts: 0 });
}

module.exports = {
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  getTransactionHistory,
  accountDeposit,
  accountWithdraw,
  accountTransfer,
  changePassword,
  getAccountByEmail,
  getAccountByTelp,
  getBalanceInfo,
  updateLoginAttempt,
  resetAttempts,
};
