const userService = require('../services/user.service');
const favoriteService = require('../services/favorite.service');
const { success } = require('../common/response');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return success(res, profile);
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user.id, req.body);
    return success(res, profile, 'Profile updated');
  } catch (err) {
    return next(err);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.list(req.user.id);
    return success(res, favorites);
  } catch (err) {
    return next(err);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.add(req.user.id, parseInt(req.params.vendorId));
    return success(res, favorite, 'Added to favorites', 201);
  } catch (err) {
    return next(err);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await favoriteService.remove(req.user.id, parseInt(req.params.vendorId));
    return success(res, {}, 'Removed from favorites');
  } catch (err) {
    return next(err);
  }
};

module.exports = { getProfile, updateProfile, getFavorites, addFavorite, removeFavorite };
