require("express-async-errors");
require("dotenv").config();

const app    = require("./app");
const logger = require("./utils/logger");
const db     = require("./db");

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await db.connect();
    logger.info("✅ Database connected");

    await db.migrate();
    logger.info("✅ Migrations complete");

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // ── Graceful shutdown ─────────────────────────────
    // Critical for zero-downtime K8s rolling updates.
    // When K8s sends SIGTERM, we stop accepting new requests
    // and finish existing ones before shutting down.
    const shutdown = async (signal) => {
      logger.info(`${signal} received — starting graceful shutdown`);
      server.close(async () => {
        logger.info("HTTP server closed");
        await db.disconnect();
        logger.info("Database pool closed — goodbye 👋");
        process.exit(0);
      });

      // Force exit after 30s if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Forced shutdown after 30s timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
}

start();
