const bankingTransactionSchema = {
  no_rekening: String,
  tanggal: Date,
  jenis_transaksi: String, 
  berita: String,
  jumlah: Number,
};

module.exports = bankingTransactionSchema;
