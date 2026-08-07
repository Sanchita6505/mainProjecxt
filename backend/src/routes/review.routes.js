const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/review.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../common/validate');
const v = require('../validators/review.validator');

const router = Router();

const reviewLimiter = rateLimit({ windowMs: 60_000, max: 30 });

router.get('/:reviewId', validate(v.idParam), controller.getById);
router.post('/', authenticate, reviewLimiter, validate(v.create), controller.create);
router.put('/:reviewId', authenticate, validate(v.update), controller.update);
router.delete('/:reviewId', authenticate, validate(v.idParam), controller.remove);

module.exports = router;
