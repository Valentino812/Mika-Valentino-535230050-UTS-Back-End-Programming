const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createAccount: {
    body: {
      nama_lengkap: joi.string().min(1).max(100).required().label('Nama'),
      tempat_lahir: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('TempatLahir'),
      tanggal_lahir: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('TanggalLahir'),
      jenis_kelamin: joi
        .string()
        .valid('Laki-laki', 'Perempuan')
        .required()
        .label('JenisKelamin'),
      alamat: joi.string().min(1).max(100).required().label('Alamat'),
      no_telepon: joi.string().min(4).max(13).required().label('NoTelp'),
      email: joi.string().email().required().label('Email'),
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
      ulangi_password: joi.string().required().label('UlangiPassword'),
    },
  },

  getInfo: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
    },
  },

  updateAccount: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
      nama_lengkap: joi.string().min(1).max(100).required().label('Nama'),
      tempat_lahir: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('TempatLahir'),
      tanggal_lahir: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('TanggalLahir'),
      jenis_kelamin: joi
        .string()
        .valid('Laki-laki', 'Perempuan')
        .required()
        .label('JenisKelamin'),
      alamat: joi.string().min(1).max(100).required().label('Alamat'),
      no_telepon: joi.string().min(4).max(13).required().label('NoTelp'),
      email: joi.string().email().required().label('Email'),
    },
  },

  deleteAccount: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
    },
  },

  transactionHistory: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
    },
    query: {
      jenis_transaksi: joi
        .string()
        .valid('masuk', 'keluar')
        .optional()
        .label('JenisTransaksi'),
      urutan: joi
        .string()
        .valid('LamaKeBaru', 'BaruKeLama')
        .default('BaruKeLama')
        .optional()
        .label('Urutan'),
    },
  },

  accountDeposit: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
      jumlah: joi.number().required().label('Jumlah'),
    },
  },

  accountWithdraw: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
      jumlah: joi.number().required().label('Jumlah'),
    },
  },

  accountTransfer: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('Password'),
      berita: joi.string().min(6).max(30).required().label('Berita'),
      noRekTujuan: joi.string().min(10).max(10).required().label('NoRekTujuan'),
      jumlah: joi.number().required().label('Jumlah'),
    },
  },

  changePassword: {
    body: {
      username: joi.string().min(6).max(30).required().label('Username'),
      password_lama: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('PasswordLama'),
      password_baru: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .min(8)
        .max(32)
        .required()
        .label('PasswordBaru'),
      ulangi_password: joi.string().required().label('UlangiPassword'),
    },
  },
};
