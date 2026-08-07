const prisma = require('../config/prisma');

const findByEmail = (email) =>
  prisma.user.findFirst({ where: { email, deletedAt: null } });

const findById = (id) =>
  prisma.user.findFirst({ where: { id, deletedAt: null } });

const create = (data) =>
  prisma.user.create({ data });

const update = (id, data) =>
  prisma.user.update({ where: { id }, data });

module.exports = { findByEmail, findById, create, update };
