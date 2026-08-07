const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const csvUpload = require('../middlewares/csvUpload');
const ctrl = require('../controllers/bulkUpload.controller');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

const csv = csvUpload.single('file');

router.post('/customers', csv, ctrl.uploadCustomers);
router.post('/vendors',   csv, ctrl.uploadVendors);
router.post('/foods',     csv, ctrl.uploadFoods);
router.post('/reviews',   csv, ctrl.uploadReviews);

module.exports = router;
