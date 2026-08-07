const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    env.NODE_ENV === 'production' ? format.json() : format.prettyPrint()
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
