const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('ADMIN').required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  username: Joi.string(),
});

module.exports = {
  schema,
  updateUserSchema,
};
