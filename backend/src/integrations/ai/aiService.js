const aiClient = require('../../config/aiClient');
const logger = require('../../config/logger');
const { AIServiceError } = require('../../common/errors');

const TIMEOUTS = {
  search: 5000,
  recommend: 8000,
  chat: 15000,
  summary: 20000,
  import: 60000,
};

const handleAIError = (err, fallback) => {
  const status = err.response?.status;
  if (status === 400) throw err;
  if (status === 404) throw err;
  if (status === 429) throw new AIServiceError('AI service rate limit reached');
  logger.error('AI service unavailable', { status, message: err.message });
  if (fallback !== undefined) return fallback;
  throw new AIServiceError('AI service is currently unavailable');
};

const semanticSearch = async (query, location, filters = {}) => {
  try {
    const { data } = await aiClient.post(
      '/api/v1/semantic-search/query',
      { query, location: location || null, filters: filters || null },
      { timeout: TIMEOUTS.search }
    );
    return data;
  } catch (err) {
    return handleAIError(err, { results: [] });
  }
};

const getRecommendations = async (userId, location, filters = {}) => {
  try {
    const { data } = await aiClient.post(
      '/api/v1/recommendations/rank',
      { query: 'street food', location: location || null, filters: filters || null },
      { timeout: TIMEOUTS.recommend }
    );
    return data;
  } catch (err) {
    return handleAIError(err, null);
  }
};

const chat = async (userId, message, location) => {
  try {
    const { data } = await aiClient.post(
      '/api/v1/rag/chat',
      { query: message, location: location || null },
      { timeout: TIMEOUTS.chat }
    );
    return data;
  } catch (err) {
    return handleAIError(err, {
      reply: 'AI assistant is currently unavailable. Please try again later.',
    });
  }
};

const getReviewSummary = async (vendorId, reviewIds) => {
  try {
    const { data } = await aiClient.post(
      '/api/v1/summaries/review',
      { vendor_id: vendorId },
      { timeout: TIMEOUTS.summary }
    );
    return data;
  } catch (err) {
    return handleAIError(err, { summary: null });
  }
};

const embedReview = async (reviewId, vendorId, text, rating) => {
  try {
    const { data } = await aiClient.post(
      '/api/v1/embeddings/reviews',
      { review_id: reviewId, vendor_id: vendorId, text, rating },
      { timeout: TIMEOUTS.import }
    );
    return data;
  } catch (err) {
    // Embedding failures must not break review creation
    logger.error('Failed to embed review', { reviewId, message: err.message });
    return null;
  }
};

module.exports = { semanticSearch, getRecommendations, chat, getReviewSummary, embedReview };
