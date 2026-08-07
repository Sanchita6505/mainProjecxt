const { Router } = require('express');
const controller = require('../controllers/vendor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../common/validate');
const v = require('../validators/vendor.validator');

const router = Router();

router.get('/', validate(v.list), controller.list);
router.get('/:vendorId', validate(v.idParam), controller.getById);
router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), validate(v.create), controller.create);
router.put('/:vendorId', authenticate, validate(v.update), controller.update);
router.delete('/:vendorId', authenticate, validate(v.idParam), controller.remove);

module.exports = router;
