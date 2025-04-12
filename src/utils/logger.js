import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `[${timestamp}] ${level.toUpperCase()} ${message} ${Object.keys(meta).length ? JSON.stringify : ''}`
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({ filename: 'logs/all-workers.log' }),
  ],
});

export default logger;