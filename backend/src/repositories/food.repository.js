const prisma = require('../config/prisma');

const findAll = ({ skip, take, where }) =>
  prisma.$transaction([
    prisma.food.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      include: { category: true },
    }),
    prisma.food.count({ where: { ...where, deletedAt: null } }),
  ]);

const findById = (id) =>
  prisma.food.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, vendor: { select: { id: true, name: true } } },
  });

const create = (data) =>
  prisma.food.create({ data, include: { category: true } });

const update = (id, data) =>
  prisma.food.update({ where: { id }, data, include: { category: true } });

const softDelete = (id) =>
  prisma.food.update({ where: { id }, data: { deletedAt: new Date() } });

module.exports = { findAll, findById, create, update, softDelete };
