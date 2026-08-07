const aiService = require('../integrations/ai/aiService');
const reviewRepo = require('../repositories/review.repository');
const vendorRepo = require('../repositories/vendor.repository');
const { NotFoundError } = require('../common/errors');

const normalizeLocation = (location) => {
  if (!location) return undefined;
  const { city, latitude, longitude } = location;
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) return undefined;
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) return undefined;
  return { city, latitude, longitude };
};

const semanticSearch = async (query, location, filters, userId) => {
  const normalizedLocation = normalizeLocation(location);
  return aiService.semanticSearch(query, normalizedLocation, filters);
};

const recommend = async (location, filters, userId) => {
  const normalizedLocation = normalizeLocation(location);
  const result = await aiService.getRecommendations(userId, normalizedLocation, filters);

  if (!result) {
    // Fallback: return top-rated vendors from DB
    const [vendors] = await vendorRepo.findAll({
      skip: 0,
      take: 10,
      where: {},
      orderBy: { avgRating: 'desc' },
    });
    return { results: vendors, fallback: true };
  }

  return result;
};

const chat = async (message, location, userId) => {
  const normalizedLocation = normalizeLocation(location);
  return aiService.chat(userId, message, normalizedLocation);
};

const reviewSummary = async (vendorId) => {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new NotFoundError('Vendor not found');

  const reviews = await reviewRepo.findByVendor(vendorId);
  const reviewIds = reviews.map((r) => r.id);

  return aiService.getReviewSummary(vendorId, reviewIds);
};

module.exports = { semanticSearch, recommend, chat, reviewSummary };
