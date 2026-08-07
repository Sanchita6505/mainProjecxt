const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  req.id = uuidv4();
  const start = Date.now();

  res.on('finish', () => {
    logger.info('Request', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.id ?? null,
    });
  });

  next();
};

module.exports = requestLogger;
