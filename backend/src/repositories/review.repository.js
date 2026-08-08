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

const findAll = ({ skip, take, where = {} }) =>
  prisma.$transaction([
    prisma.review.findMany({
      skip, take,
      where: { ...where, deletedAt: null },
      include: {
        user: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { ...where, deletedAt: null } }),
  ]);
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
  findAll,
  create,
  update,
  softDelete,
  getVendorRatingStats,
};
