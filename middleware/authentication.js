const config = require('../config');
const { getToken } = require('../utils/get-token');
const jwt = require('jsonwebtoken');

const decodeToken = (req, res, next) => {
  try {
    let token = getToken(req);
    if (!token)
      return res.status(401).json({
        status: 'failed',
        message: 'mohon lakukan login',
      });

    req.user = jwt.verify(token, config.accessTokenKey);
  } catch (error) {
    console.log(error.name);
    if (
      (error && error.name === 'JsonWebTokenError') ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        status: 'failed',
        message: error.message,
      });
    }
  }
  next();
};

module.exports = {
  decodeToken,
};
