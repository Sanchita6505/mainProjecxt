const vendorRepo = require('../repositories/vendor.repository');
const { NotFoundError, AuthorizationError } = require('../common/errors');
const { buildPagination, getPaginationParams } = require('../common/pagination');

const buildWhere = (query) => {
  const where = {};
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.minRating) where.avgRating = { gte: parseFloat(query.minRating) };
  if (query.category) {
    where.categories = { some: { category: { slug: query.category } } };
  }
  return where;
};

const list = async (query) => {
  const { page, limit } = getPaginationParams(query);
  const orderBy = { [query.sort || 'createdAt']: query.order || 'desc' };
  const [vendors, total] = await vendorRepo.findAll({
    skip: (page - 1) * limit,
    take: limit,
    where: buildWhere(query),
    orderBy,
  });
  return { vendors, pagination: buildPagination(page, limit, total) };
};

const getById = async (vendorId) => {
  const vendor = await vendorRepo.findById(parseInt(vendorId));
  if (!vendor) throw new NotFoundError('Vendor not found');
  return vendor;
};

const create = async (data, userId) => {
  const { categoryIds, ...vendorData } = data;
  return vendorRepo.create({ ...vendorData, ownerId: userId }, categoryIds);
};

const update = async (vendorId, data, userId, userRole) => {
  const vendor = await getById(vendorId);
  if (userRole !== 'ADMIN' && vendor.ownerId !== userId) {
    throw new AuthorizationError('Not authorized to update this vendor');
  }
  const { categoryIds, ...vendorData } = data;
  return vendorRepo.update(parseInt(vendorId), vendorData, categoryIds);
};

const remove = async (vendorId, userId, userRole) => {
  const vendor = await getById(vendorId);
  if (userRole !== 'ADMIN' && vendor.ownerId !== userId) {
    throw new AuthorizationError('Not authorized to delete this vendor');
  }
  await vendorRepo.softDelete(parseInt(vendorId));
};

module.exports = { list, getById, create, update, remove };
