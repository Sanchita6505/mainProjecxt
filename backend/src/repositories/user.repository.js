const prisma = require('../config/prisma');

const findByEmail = (email) =>
  prisma.user.findFirst({ where: { email, deletedAt: null } });

const findById = (id) =>
  prisma.user.findFirst({ where: { id, deletedAt: null } });

const findAll = ({ skip, take, where = {} }) =>
  prisma.$transaction([
    prisma.user.findMany({
      skip, take,
      where: { ...where, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, city: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { ...where, deletedAt: null } }),
  ]);

const create = (data) =>
  prisma.user.create({ data });

const update = (id, data) =>
  prisma.user.update({ where: { id }, data });

const softDelete = (id) =>
  prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });

module.exports = { findByEmail, findById, findAll, create, update, softDelete };
