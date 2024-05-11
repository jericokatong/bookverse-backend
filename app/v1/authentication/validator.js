const Joi = require('joi');

const registrationSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const peminjamLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('PEMINJAM').required(),
});

const penjagaLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('PENJAGA').required(),
});

const adminLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('ADMIN').required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  registrationSchema,
  peminjamLoginSchema,
  penjagaLoginSchema,
  adminLoginSchema,
  refreshTokenSchema,
};
