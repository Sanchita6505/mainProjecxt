const logger = require('../config/logger');
const { AppError } = require('./errors');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists.',
      errors: [],
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found.',
      errors: [],
    });
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack, requestId: req.id });

  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
    errors: [],
  });
};

module.exports = errorMiddleware;
