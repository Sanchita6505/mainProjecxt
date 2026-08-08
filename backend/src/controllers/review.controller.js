const reviewService = require('../services/review.service');
const { success, created, noContent } = require('../common/response');

const listByVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.query;
    const reviews = await reviewService.listByVendor(parseInt(vendorId));
    return success(res, reviews);
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const review = await reviewService.getById(req.validated.params.reviewId);
    return success(res, review);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const review = await reviewService.create(req.validated.body, req.user.id);
    return created(res, review, 'Review created');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const review = await reviewService.update(
      req.validated.params.reviewId,
      req.validated.body,
      req.user.id,
      req.user.role
    );
    return success(res, review, 'Review updated');
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await reviewService.remove(req.validated.params.reviewId, req.user.id, req.user.role);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
};

module.exports = { listByVendor, getById, create, update, remove };
