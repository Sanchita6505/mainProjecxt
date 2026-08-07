const prisma = require('../config/prisma');

const findByUser = (userId) =>
  prisma.favorite.findMany({
    where: { userId },
    include: { vendor: { include: { categories: { include: { category: true } } } } },
  });

const find = (userId, vendorId) =>
  prisma.favorite.findUnique({ where: { userId_vendorId: { userId, vendorId } } });

const create = (userId, vendorId) =>
  prisma.favorite.create({ data: { userId, vendorId } });

const remove = (userId, vendorId) =>
  prisma.favorite.delete({ where: { userId_vendorId: { userId, vendorId } } });

module.exports = { findByUser, find, create, remove };
