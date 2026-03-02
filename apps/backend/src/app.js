const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const compression  = require("compression");
const rateLimit    = require("express-rate-limit");

const { errorHandler }  = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/requestLogger");

const healthRoutes  = require("./routes/health");
const productRoutes = require("./routes/products");
const orderRoutes   = require("./routes/orders");
const userRoutes    = require("./routes/users");

const app = express();

// ── Security headers ──────────────────────────────────
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate limiting ─────────────────────────────────────
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
}));

// Stricter limit on auth routes
app.use(["/api/v1/users/login", "/api/v1/users/register"], rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts. Try again later." },
}));

// ── Body & compression ────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────
app.use("/health",        healthRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders",   orderRoutes);
app.use("/api/v1/users",    userRoutes);

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────
app.use(errorHandler);

module.exports = app;
