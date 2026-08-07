const { AuthorizationError } = require('../common/errors');

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new AuthorizationError('Insufficient permissions'));
  }
  return next();
};

module.exports = authorize;
