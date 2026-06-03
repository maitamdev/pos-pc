/**
 * Parse pagination params from query string
 * Returns { limit, offset, page }
 */
const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build paginated response
 */
const paginatedResponse = (rows, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

module.exports = { paginate, paginatedResponse };