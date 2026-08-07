const userRepo = require('../repositories/user.repository');
const { NotFoundError } = require('../common/errors');

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const { passwordHash, ...profile } = user;
  return profile;
};

const updateProfile = async (userId, data) => {
  await getProfile(userId);
  const updated = await userRepo.update(userId, data);
  const { passwordHash, ...profile } = updated;
  return profile;
};

module.exports = { getProfile, updateProfile };
