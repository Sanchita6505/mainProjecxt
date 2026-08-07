const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const validate = require('../common/validate');
const { register, login } = require('../validators/auth.validator');

const router = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });

router.post('/register', authLimiter, validate(register), controller.register);
router.post('/login', authLimiter, validate(login), controller.login);

module.exports = router;
