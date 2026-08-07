const axios = require('axios');
const env = require('./env');
const logger = require('./logger');

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(env.AI_SERVICE_API_KEY && { 'X-API-Key': env.AI_SERVICE_API_KEY }),
  },
});

aiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

aiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    logger.debug('AI service response', {
      url: response.config.url,
      status: response.status,
      durationMs: duration,
    });
    return response;
  },
  (error) => {
    const duration = error.config?.metadata
      ? Date.now() - error.config.metadata.startTime
      : null;
    logger.error('AI service error', {
      url: error.config?.url,
      status: error.response?.status,
      durationMs: duration,
    });
    return Promise.reject(error);
  }
);

module.exports = aiClient;
