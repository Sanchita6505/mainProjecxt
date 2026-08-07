const searchService = require('../services/search.service');
const { success } = require('../common/response');

const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return success(res, { vendors: [], foods: [] });
    }
    const results = await searchService.search(q.trim(), req.query);
    return success(res, results);
  } catch (err) {
    return next(err);
  }
};

module.exports = { search };
