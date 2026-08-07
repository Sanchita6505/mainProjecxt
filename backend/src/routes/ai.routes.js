const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../common/validate');
const v = require('../validators/ai.validator');

const router = Router();

const searchLimiter = rateLimit({ windowMs: 60_000, max: 60 });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 20 });

router.post('/search', searchLimiter, validate(v.search), controller.search);
router.post('/recommend', authenticate, validate(v.recommend), controller.recommend);
router.post('/chat', authenticate, chatLimiter, validate(v.chat), controller.chat);
router.post('/review-summary', validate(v.reviewSummary), controller.reviewSummary);

module.exports = router;
