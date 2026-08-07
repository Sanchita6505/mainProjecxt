const foodRepo = require('../repositories/food.repository');
const vendorRepo = require('../repositories/vendor.repository');
const { NotFoundError, AuthorizationError } = require('../common/errors');
const { buildPagination, getPaginationParams } = require('../common/pagination');

const buildWhere = (query) => {
  const where = {};
  if (query.vendorId) where.vendorId = parseInt(query.vendorId);
  if (query.categoryId) where.categoryId = parseInt(query.categoryId);
  if (query.isVeg !== undefined) where.isVeg = query.isVeg === 'true';
  if (query.maxPrice) where.price = { lte: parseFloat(query.maxPrice) };
  return where;
};

const list = async (query) => {
  const { page, limit } = getPaginationParams(query);
  const [foods, total] = await foodRepo.findAll({
    skip: (page - 1) * limit,
    take: limit,
    where: buildWhere(query),
  });
  return { foods, pagination: buildPagination(page, limit, total) };
};

const getById = async (foodId) => {
  const food = await foodRepo.findById(parseInt(foodId));
  if (!food) throw new NotFoundError('Food not found');
  return food;
};

const assertVendorOwner = async (vendorId, userId, userRole) => {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new NotFoundError('Vendor not found');
  if (userRole !== 'ADMIN' && vendor.ownerId !== userId) {
    throw new AuthorizationError('Not authorized to manage this vendor\'s foods');
  }
};

const create = async (data, userId, userRole) => {
  await assertVendorOwner(data.vendorId, userId, userRole);
  return foodRepo.create(data);
};

const update = async (foodId, data, userId, userRole) => {
  const food = await getById(foodId);
  await assertVendorOwner(food.vendorId, userId, userRole);
  return foodRepo.update(parseInt(foodId), data);
};

const remove = async (foodId, userId, userRole) => {
  const food = await getById(foodId);
  await assertVendorOwner(food.vendorId, userId, userRole);
  await foodRepo.softDelete(parseInt(foodId));
};

module.exports = { list, getById, create, update, remove };
