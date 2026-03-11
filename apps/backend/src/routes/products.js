const express = require("express");
const Joi     = require("joi");
const db      = require("../db");
const { AppError } = require("../middleware/errorHandler");
const { productsViewedCounter } = require("../metrics");

const router = express.Router();

const productSchema = Joi.object({
  name:        Joi.string().min(2).max(255).required(),
  description: Joi.string().max(2000).optional().allow(""),
  price:       Joi.number().positive().precision(2).required(),
  stock:       Joi.number().integer().min(0).required(),
  category:    Joi.string().max(100).optional().allow(""),
  image_url:   Joi.string().uri().optional().allow(""),
});

// GET /api/v1/products?category=Electronics&search=laptop&page=1&limit=12
router.get("/", async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query  = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) { params.push(category); query += ` AND category = $${params.length}`; }
  if (search)   {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  const countResult = await db.query(
    query.replace("SELECT *", "SELECT COUNT(*)"), params
  );
  const total = parseInt(countResult.rows[0].count);

  query += " ORDER BY created_at DESC";
  params.push(parseInt(limit));  query += ` LIMIT $${params.length}`;
  params.push(offset);           query += ` OFFSET $${params.length}`;

  const result = await db.query(query, params);

  // Record products list view
  productsViewedCounter.add(1, {
    type: 'list',
    category: category || 'all',
  });

  res.json({
    data: result.rows,
    pagination: {
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/v1/products/:id
router.get("/:id", async (req, res) => {
  const result = await db.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
  if (!result.rows[0]) throw new AppError("Product not found", 404);

  // Record individual product view
  productsViewedCounter.add(1, {
    type: 'detail',
    category: result.rows[0].category || 'unknown',
  });

  res.json({ data: result.rows[0] });
});

// POST /api/v1/products
router.post("/", async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const { name, description, price, stock, category, image_url } = value;
  const result = await db.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, description, price, stock, category, image_url]
  );
  res.status(201).json({ data: result.rows[0] });
});

// PUT /api/v1/products/:id
router.put("/:id", async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const { name, description, price, stock, category, image_url } = value;
  const result = await db.query(
    `UPDATE products
     SET name=$1, description=$2, price=$3, stock=$4, category=$5, image_url=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [name, description, price, stock, category, image_url, req.params.id]
  );
  if (!result.rows[0]) throw new AppError("Product not found", 404);
  res.json({ data: result.rows[0] });
});

// DELETE /api/v1/products/:id
router.delete("/:id", async (req, res) => {
  const result = await db.query(
    "DELETE FROM products WHERE id=$1 RETURNING id", [req.params.id]
  );
  if (!result.rows[0]) throw new AppError("Product not found", 404);
  res.status(204).send();
});

module.exports = router;