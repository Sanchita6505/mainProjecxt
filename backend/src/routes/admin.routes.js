const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ctrl = require('../controllers/admin.controller');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/users', ctrl.listUsers);
router.delete('/users/:userId', ctrl.deleteUser);
router.get('/reviews', ctrl.listReviews);
router.delete('/reviews/:reviewId', ctrl.deleteReview);

module.exports = router;
