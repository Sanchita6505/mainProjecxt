const buildPagination = (page, limit, total) => ({
  page,
  limit,
  totalItems: total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrevious: page > 1,
});

const getPaginationParams = (query) => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit) || 20)),
});

module.exports = { buildPagination, getPaginationParams };
