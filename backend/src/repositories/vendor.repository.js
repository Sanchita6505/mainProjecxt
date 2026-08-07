const prisma = require('../config/prisma');

const findAll = ({ skip, take, where, orderBy }) =>
  prisma.$transaction([
    prisma.vendor.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: { categories: { include: { category: true } } },
    }),
    prisma.vendor.count({ where: { ...where, deletedAt: null } }),
  ]);

const findById = (id) =>
  prisma.vendor.findFirst({
    where: { id, deletedAt: null },
    include: {
      categories: { include: { category: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

const create = (data, categoryIds = []) =>
  prisma.vendor.create({
    data: {
      ...data,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    include: { categories: { include: { category: true } } },
  });

const update = (id, data, categoryIds) =>
  prisma.$transaction(async (tx) => {
    if (categoryIds !== undefined) {
      await tx.vendorCategory.deleteMany({ where: { vendorId: id } });
      await tx.vendorCategory.createMany({
        data: categoryIds.map((categoryId) => ({ vendorId: id, categoryId })),
      });
    }
    return tx.vendor.update({
      where: { id },
      data,
      include: { categories: { include: { category: true } } },
    });
  });

const softDelete = (id) =>
  prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });

const updateRating = (id, avgRating, reviewCount) =>
  prisma.vendor.update({ where: { id }, data: { avgRating, reviewCount } });

module.exports = { findAll, findById, create, update, softDelete, updateRating };
