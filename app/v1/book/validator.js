const Joi = require('joi');

const schema = Joi.object({
  judul_buku: Joi.string().required(),
  nama_pengarang: Joi.string().required(),
  penerbit: Joi.string().required(),
  tahun_terbit: Joi.number().integer().strict().required(),
  isbn: Joi.string().required(),
  total_stock: Joi.number().integer().strict().required(),
});

const updateBookSchema = Joi.object({
  judul_buku: Joi.string(),
  nama_pengarang: Joi.string(),
  penerbit: Joi.string(),
  tahun_terbit: Joi.number().integer().strict(),
  isbn: Joi.string(),
  jumlah_tersedia: Joi.number().integer().strict(),
});

module.exports = { schema, updateBookSchema };
