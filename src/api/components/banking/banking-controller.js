const bankingService = require('./banking-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle create account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    const nama_lengkap = request.body.nama_lengkap;
    const tempat_lahir = request.body.tempat_lahir;
    const tanggal_lahir = request.body.tanggal_lahir;
    const jenis_kelamin = request.body.jenis_kelamin;
    const alamat = request.body.alamat;
    const no_telepon = request.body.no_telepon;
    const email = request.body.email;
    const username = request.body.username;
    const password = request.body.password;
    const ulangi_password = request.body.ulangi_password;

    // Mengecek konfirmasi pengulangan password
    if (password !== ulangi_password) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Pengulangan konfirmasi password tidak sesuai'
      );
    }

    // Username harus unik
    const usernameTaken = await bankingService.usernameTaken(username);
    if (usernameTaken) {
      throw errorResponder(
        errorTypes.DB_DUPLICATE_CONFLICT,
        'Username telah di ambil'
      );
    }

    // Email dan nomor telepon harus unik
    const alreadyRegistered = await bankingService.alreadyRegistered(
      username,
      email,
      no_telepon
    );
    if (alreadyRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Data telah di daftarkan'
      );
    }

    const success = await bankingService.createAccount(
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email,
      username,
      password
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Pembuatan akun gagal'
      );
    }
    const no_rekening = await bankingService.getNoRek(username);

    return response.status(200).json({ username, no_rekening });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get account info request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getInfo(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const info = await bankingService.getInfo(username);

    return response.status(200).json(info);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update account info request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccount(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;
    const nama_lengkap = request.body.nama_lengkap;
    const tempat_lahir = request.body.tempat_lahir;
    const tanggal_lahir = request.body.tanggal_lahir;
    const jenis_kelamin = request.body.jenis_kelamin;
    const alamat = request.body.alamat;
    const no_telepon = request.body.no_telepon;
    const email = request.body.email;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Email dan nomor telepon harus unik
    const alreadyRegistered = await bankingService.alreadyRegistered(
      username,
      email,
      no_telepon
    );
    if (alreadyRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Data telah di daftarkan'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const success = await bankingService.updateAccount(
      username,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email
    );

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Update account gagal'
      );
    }

    return response.status(200).json({
      username,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_telepon,
      email,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
          attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const success = await bankingService.deleteAccount(username);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Penghapusan akun gagal'
      );
    }

    return response.status(200).json({ username });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get account transaction history request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transactionHistory(request, response, next) {
  try {
    const jenis_transaksi = request.query.jenis_transaksi;
    const urutan = request.query.urutan;
    const username = request.body.username;
    const password = request.body.password;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const success = await bankingService.getTransactionHistory(
      jenis_transaksi,
      urutan,
      username
    );

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to show transaction history'
      );
    }

    return response.status(200).json({ success });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function accountDeposit(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;
    const jumlah = request.body.jumlah;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const success = await bankingService.accountDeposit(username, jumlah);

    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Deposit gagal');
    }

    return response.status(200).json({ username, jumlah, success });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle withdraw request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function accountWithdraw(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;
    const jumlah = request.body.jumlah;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    // Cek jumlah saldo bila mencukupi
    const currentBalance = await bankingService.getAccountBalance(username);
    if (currentBalance - jumlah < 0) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Saldo tidak mencukupi'
      );
    }

    const success = await bankingService.accountWithdraw(username, jumlah);

    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Withdraw gagal');
    }

    return response.status(200).json({ username, jumlah, success });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle transfer request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function accountTransfer(request, response, next) {
  try {
    const username = request.body.username;
    const password = request.body.password;
    const berita = request.body.berita;
    const noRekTujuan = request.body.noRekTujuan;
    const jumlah = request.body.jumlah;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Cek kebenaran password (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    // Cek jumlah saldo bila mencukupi
    const currentBalance = await bankingService.getAccountBalance(username);
    if (currentBalance - jumlah < 0) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Saldo tidak mencukupi'
      );
    }

    const success = await bankingService.accountTransfer(
      username,
      berita,
      noRekTujuan,
      jumlah
    );

    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Transfer gagal');
    }

    return response
      .status(200)
      .json({ username, jumlah, noRekTujuan, success });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change account password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    const username = request.body.username;
    const password_lama = request.body.password_lama;
    const password_baru = request.body.password_baru;
    const ulangi_password = request.body.ulangi_password;

    // Cek status akun (terblokir atau tidak)
    const blocked = await bankingService.attemptsLimitReached(username);
    if (blocked) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Layanan anda telah terblokir, silahkan hubungi costumer service'
      );
    }

    // Mengecek konfirmasi pengulangan password
    if (password_baru !== ulangi_password) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Pengulangan konfirmasi password tidak sesuai'
      );
    }

    // Cek kebenaran password lama (bila tidak benar maka dicatat kegagalanya pada failed login attempts)
    if (!(await bankingService.checkPassword(username, password_lama))) {
      const addAttempts = await bankingService.addAttempts(username);
      const getAttempts = await bankingService.getAttempts(username);
      const attemptsLeft = (getAttempts - 3) * -1;
      const attemptsLimitReached =
        await bankingService.attemptsLimitReached(username);
      if (attemptsLimitReached) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Layanan anda telah terblokir, silahkan hubungi costumer service'
        );
      } else {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Password anda salah. Anda dapat memasukan password sebanyak ' +
            attemptsLeft +
            ' kali lagi sebelum terblokir'
        );
      }
    } else {
      const resetAttempts = bankingService.resetAttempts(username);
    }

    const changeSuccess = await bankingService.changePassword(
      username,
      password_baru
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Pengubahan password gagal'
      );
    }

    return response.status(200).json(username);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAccount,
  getInfo,
  updateAccount,
  deleteAccount,
  transactionHistory,
  accountDeposit,
  accountWithdraw,
  accountTransfer,
  changePassword,
};
