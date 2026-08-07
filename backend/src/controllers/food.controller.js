const foodService = require('../services/food.service');
const { success, created, noContent, paginated } = require('../common/response');

const list = async (req, res, next) => {
  try {
    const { foods, pagination } = await foodService.list(req.validated.query);
    return paginated(res, foods, pagination);
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const food = await foodService.getById(req.validated.params.foodId);
    return success(res, food);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const food = await foodService.create(req.validated.body, req.user.id, req.user.role);
    return created(res, food, 'Food created');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const food = await foodService.update(
      req.validated.params.foodId,
      req.validated.body,
      req.user.id,
      req.user.role
    );
    return success(res, food, 'Food updated');
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await foodService.remove(req.validated.params.foodId, req.user.id, req.user.role);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
};

module.exports = { list, getById, create, update, remove };
