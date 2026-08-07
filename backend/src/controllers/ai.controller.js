const aiService = require('../services/ai.service');
const { success } = require('../common/response');

const search = async (req, res, next) => {
  try {
    const { query, location, filters } = req.validated.body;
    const result = await aiService.semanticSearch(query, location, filters, req.user?.id);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};

const recommend = async (req, res, next) => {
  try {
    const { location, filters } = req.validated.body;
    const result = await aiService.recommend(location, filters, req.user?.id);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};

const chat = async (req, res, next) => {
  try {
    const { message, location } = req.validated.body;
    const result = await aiService.chat(message, location, req.user?.id);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};

const reviewSummary = async (req, res, next) => {
  try {
    const { vendorId } = req.validated.body;
    const result = await aiService.reviewSummary(vendorId);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};

module.exports = { search, recommend, chat, reviewSummary };
