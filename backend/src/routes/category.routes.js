const { Router } = require('express');
const controller = require('../controllers/category.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.get('/', controller.list);
router.post('/', authenticate, authorize('ADMIN'), controller.create);

module.exports = router;
