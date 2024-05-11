const Joi = require('joi');

const createPinjamanSchema = Joi.object({
  id_peminjam: Joi.string().required(),
});

module.exports = {
  createPinjamanSchema,
};
