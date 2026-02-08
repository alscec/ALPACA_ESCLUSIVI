import winston from 'winston';

// Configure Winston for GCP Cloud Logging compatibility
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'alpaca-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for Cloud Run (stdout/stderr)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: process.env.NODE_ENV === 'development' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// In production, Cloud Run automatically sends stdout/stderr to Cloud Logging
// with proper severity mapping based on log levels

export default logger;
