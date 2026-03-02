const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const ms    = Date.now() - start;
    const level = res.statusCode >= 500 ? "error"
                : res.statusCode >= 400 ? "warn"
                : "info";

    logger[level]("HTTP Request", {
      method:     req.method,
      path:       req.path,
      statusCode: res.statusCode,
      ms:         `${ms}ms`,
      ip:         req.ip,
    });
  });

  next();
};

module.exports = { requestLogger };
