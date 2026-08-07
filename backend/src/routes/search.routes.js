const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/search.controller');

const router = Router();

const searchLimiter = rateLimit({ windowMs: 60_000, max: 60 });

router.get('/', searchLimiter, controller.search);

module.exports = router;
