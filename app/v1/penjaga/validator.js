const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('PENJAGA').required(),
});

module.exports = {
  schema,
};
