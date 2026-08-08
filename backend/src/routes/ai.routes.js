const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const controller = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../common/validate');
const v = require('../validators/ai.validator');

const router = Router();

const searchLimiter = rateLimit({ windowMs: 60_000, max: 60 });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 20 });

// Debug middleware for chat endpoint
const debugChatBody = (req, res, next) => {
  logger.info('Chat request body:', { 
    body: req.body, 
    contentType: req.headers['content-type'],
    method: req.method,
    path: req.path
  });
  next();
};

router.post('/search', searchLimiter, validate(v.search), controller.search);
router.post('/recommend', authenticate, validate(v.recommend), controller.recommend);
router.post('/chat', authenticate, chatLimiter, debugChatBody, validate(v.chat), controller.chat);
router.post('/review-summary', validate(v.reviewSummary), controller.reviewSummary);

module.exports = router;
