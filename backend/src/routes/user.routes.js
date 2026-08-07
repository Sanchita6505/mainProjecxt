const { Router } = require('express');
const controller = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);
router.get('/favorites', controller.getFavorites);
router.post('/favorites/:vendorId', controller.addFavorite);
router.delete('/favorites/:vendorId', controller.removeFavorite);

module.exports = router;
