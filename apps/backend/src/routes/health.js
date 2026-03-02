const express = require("express");
const db      = require("../db");

const router = express.Router();

// Liveness — is the process alive?
// K8s restarts the pod if this fails
router.get("/live", (req, res) => {
  res.json({
    status:    "alive",
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
    pid:       process.pid,
  });
});

// Readiness — is the app ready to handle traffic?
// K8s stops routing traffic if this fails (but does not restart)
router.get("/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      status:    "ready",
      timestamp: new Date().toISOString(),
      checks:    { database: "ok" },
    });
  } catch (err) {
    res.status(503).json({
      status:    "not ready",
      timestamp: new Date().toISOString(),
      checks:    { database: "unavailable" },
      error:     err.message,
    });
  }
});

// Startup probe — has the app finished starting?
// K8s waits for this before starting liveness/readiness checks
router.get("/startup", (req, res) => {
  res.json({ status: "started", timestamp: new Date().toISOString() });
});

module.exports = router;
