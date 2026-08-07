const prisma = require('../config/prisma');

const findById = (id) =>
  prisma.review.findFirst({
    where: { id, deletedAt: null },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

const findByVendor = (vendorId) =>
  prisma.review.findMany({
    where: { vendorId, deletedAt: null },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

const findByUserAndVendor = (userId, vendorId) =>
  prisma.review.findFirst({ where: { userId, vendorId, deletedAt: null } });

const create = (data) =>
  prisma.review.create({ data });

const update = (id, data) =>
  prisma.review.update({ where: { id }, data });

const softDelete = (id) =>
  prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });

const getVendorRatingStats = (vendorId) =>
  prisma.review.aggregate({
    where: { vendorId, deletedAt: null },
    _avg: { rating: true },
    _count: { id: true },
  });

module.exports = {
  findById,
  findByVendor,
  findByUserAndVendor,
  create,
  update,
  softDelete,
  getVendorRatingStats,
};
