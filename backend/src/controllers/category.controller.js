const categoryService = require('../services/category.service');
const { success, created } = require('../common/response');

const list = async (req, res, next) => {
  try {
    const categories = await categoryService.list();
    return success(res, categories);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    return created(res, category, 'Category created');
  } catch (err) {
    return next(err);
  }
};

module.exports = { list, create };
