const bankingAccountInfoSchema = {
  nama_lengkap: String,
  tempat_lahir: String,
  tanggal_lahir: String,
  jenis_kelamin: String,
  alamat: String,
  no_telepon: String,
  email: String,
  username: String, 
  password: String,
  attempts: Number,
};

module.exports = bankingAccountInfoSchema;
