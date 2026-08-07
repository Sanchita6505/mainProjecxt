const authService = require('../services/auth.service');
const { success, created } = require('../common/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.validated.body);
    return created(res, result, 'Registration successful');
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validated.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
