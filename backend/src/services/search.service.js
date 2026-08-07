const prisma = require('../config/prisma');
const { buildPagination, getPaginationParams } = require('../common/pagination');

const search = async (q, query) => {
  const { page, limit } = getPaginationParams(query);
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ],
  };

  const [vendors, vendorCount] = await prisma.$transaction([
    prisma.vendor.findMany({ skip, take: limit, where }),
    prisma.vendor.count({ where }),
  ]);

  const foodWhere = {
    deletedAt: null,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ],
  };

  const [foods, foodCount] = await prisma.$transaction([
    prisma.food.findMany({ skip, take: limit, where: foodWhere }),
    prisma.food.count({ where: foodWhere }),
  ]);

  return {
    vendors: { items: vendors, pagination: buildPagination(page, limit, vendorCount) },
    foods: { items: foods, pagination: buildPagination(page, limit, foodCount) },
  };
};

module.exports = { search };
