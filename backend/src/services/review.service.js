const reviewRepo = require('../repositories/review.repository');
const vendorRepo = require('../repositories/vendor.repository');
const aiService = require('../integrations/ai/aiService');
const { NotFoundError, AuthorizationError, ConflictError } = require('../common/errors');

const getById = async (reviewId) => {
  const review = await reviewRepo.findById(parseInt(reviewId));
  if (!review) throw new NotFoundError('Review not found');
  return review;
};

const create = async ({ vendorId, rating, text }, userId) => {
  const existing = await reviewRepo.findByUserAndVendor(userId, vendorId);
  if (existing) throw new ConflictError('You have already reviewed this vendor');

  const review = await reviewRepo.create({ userId, vendorId, rating, text });

  // Recalculate vendor rating
  const stats = await reviewRepo.getVendorRatingStats(vendorId);
  await vendorRepo.updateRating(vendorId, stats._avg.rating ?? 0, stats._count.id);

  // Trigger embedding — failure must not affect review creation
  if (text) {
    aiService.embedReview(review.id, vendorId, text, rating).then((result) => {
      const embeddingId = result?.data?.embedding_id;
      if (embeddingId) {
        reviewRepo.update(review.id, { embeddingId });
      }
    });
  }

  return review;
};

const update = async (reviewId, data, userId, userRole) => {
  const review = await getById(reviewId);
  if (userRole !== 'ADMIN' && review.userId !== userId) {
    throw new AuthorizationError('Not authorized to update this review');
  }
  return reviewRepo.update(parseInt(reviewId), data);
};

const remove = async (reviewId, userId, userRole) => {
  const review = await getById(reviewId);
  if (userRole !== 'ADMIN' && review.userId !== userId) {
    throw new AuthorizationError('Not authorized to delete this review');
  }
  await reviewRepo.softDelete(parseInt(reviewId));

  const stats = await reviewRepo.getVendorRatingStats(review.vendorId);
  await vendorRepo.updateRating(review.vendorId, stats._avg.rating ?? 0, stats._count.id);
};

module.exports = { getById, create, update, remove };
