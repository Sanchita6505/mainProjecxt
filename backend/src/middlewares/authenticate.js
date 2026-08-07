const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AuthenticationError } = require('../common/errors');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(new AuthenticationError('Invalid or expired token'));
  }
};

module.exports = authenticate;
