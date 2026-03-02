const express = require("express");
const Joi     = require("joi");
const crypto  = require("crypto");
const db      = require("../db");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

// Simple sha256 hash — replace with bcrypt in production
const hashPassword = (pw) =>
  crypto.createHash("sha256")
    .update(pw + (process.env.SECRET_KEY || "dev-secret"))
    .digest("hex");

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(255).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// POST /api/v1/users/register
router.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const { name, email, password } = value;
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashPassword(password)]
  );
  res.status(201).json({ data: result.rows[0] });
});

// POST /api/v1/users/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required", 400);

  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const user   = result.rows[0];

  if (!user || user.password_hash !== hashPassword(password))
    throw new AppError("Invalid credentials", 401);

  // In production: return a signed JWT
  res.json({
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: `demo-token-${user.id}`,
  });
});

// GET /api/v1/users
router.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  res.json({ data: result.rows });
});

// GET /api/v1/users/:id
router.get("/:id", async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [req.params.id]
  );
  if (!result.rows[0]) throw new AppError("User not found", 404);
  res.json({ data: result.rows[0] });
});

module.exports = router;
