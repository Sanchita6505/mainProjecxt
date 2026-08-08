const userRepo = require('../repositories/user.repository');
const reviewRepo = require('../repositories/review.repository');
const { paginated } = require('../common/response');
const { getPaginationParams, buildPagination } = require('../common/pagination');

const listUsers = async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await userRepo.findAll({ skip: (page - 1) * limit, take: limit, where });
    return paginated(res, users, buildPagination(page, limit, total));
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userRepo.softDelete(parseInt(req.params.userId));
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

const listReviews = async (req, res, next) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const where = {};
    if (req.query.vendorId) where.vendorId = parseInt(req.query.vendorId);
    const [reviews, total] = await reviewRepo.findAll({ skip: (page - 1) * limit, take: limit, where });
    return paginated(res, reviews, buildPagination(page, limit, total));
  } catch (err) {
    return next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewRepo.softDelete(parseInt(req.params.reviewId));
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = { listUsers, deleteUser, listReviews, deleteReview };
