const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production"
      // Structured JSON for Google Cloud Logging
      ? winston.format.json()
      // Pretty colored output for local dev
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const extra = Object.keys(meta).length
              ? "\n" + JSON.stringify(meta, null, 2)
              : "";
            return `${timestamp} [${level}]: ${message}${extra}`;
          })
        )
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
