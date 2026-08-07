const prisma = require('../config/prisma');

const findAll = () => prisma.category.findMany({ orderBy: { name: 'asc' } });

const findById = (id) => prisma.category.findUnique({ where: { id } });

const findBySlug = (slug) => prisma.category.findUnique({ where: { slug } });

const create = (data) => prisma.category.create({ data });

module.exports = { findAll, findById, findBySlug, create };
