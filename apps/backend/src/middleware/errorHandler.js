const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let { message, statusCode = 500 } = err;

  // Map Postgres error codes to friendly messages
  if (err.code === "23505") { statusCode = 409; message = "Resource already exists"; }
  if (err.code === "23503") { statusCode = 400; message = "Referenced resource not found"; }
  if (err.code === "22P02") { statusCode = 400; message = "Invalid ID format"; }

  // Hide internal details in production
  if (!err.isOperational && process.env.NODE_ENV === "production") {
    message = "Internal server error";
  }

  logger.error("Request error", {
    statusCode,
    message,
    method: req.method,
    path:   req.path,
    stack:  err.stack,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };
