const favoriteRepo = require('../repositories/favorite.repository');
const vendorRepo = require('../repositories/vendor.repository');
const { NotFoundError, ConflictError } = require('../common/errors');

const list = (userId) => favoriteRepo.findByUser(userId);

const add = async (userId, vendorId) => {
  const vendor = await vendorRepo.findById(vendorId);
  if (!vendor) throw new NotFoundError('Vendor not found');

  const existing = await favoriteRepo.find(userId, vendorId);
  if (existing) throw new ConflictError('Already in favorites');

  return favoriteRepo.create(userId, vendorId);
};

const remove = async (userId, vendorId) => {
  const existing = await favoriteRepo.find(userId, vendorId);
  if (!existing) throw new NotFoundError('Favorite not found');
  await favoriteRepo.remove(userId, vendorId);
};

module.exports = { list, add, remove };
