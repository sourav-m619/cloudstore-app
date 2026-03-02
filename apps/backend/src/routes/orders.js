const express = require("express");
const Joi     = require("joi");
const db      = require("../db");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

const orderSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      quantity:   Joi.number().integer().positive().required(),
    })
  ).min(1).required(),
  shipping_address: Joi.object({
    street:  Joi.string().required(),
    city:    Joi.string().required(),
    state:   Joi.string().required(),
    zip:     Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});

// GET /api/v1/orders?user_id=xxx&status=pending&page=1&limit=10
router.get("/", async (req, res) => {
  const { user_id, status, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];

  let query = `
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id',           oi.id,
            'product_id',   oi.product_id,
            'product_name', p.name,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products    p  ON oi.product_id = p.id
    WHERE 1=1
  `;

  if (user_id) { params.push(user_id); query += ` AND o.user_id = $${params.length}`; }
  if (status)  { params.push(status);  query += ` AND o.status  = $${params.length}`; }

  query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
  params.push(parseInt(limit)); query += ` LIMIT $${params.length}`;
  params.push(offset);          query += ` OFFSET $${params.length}`;

  const result = await db.query(query, params);
  res.json({ data: result.rows });
});

// GET /api/v1/orders/:id
router.get("/:id", async (req, res) => {
  const result = await db.query(`
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id',           oi.id,
            'product_id',   oi.product_id,
            'product_name', p.name,
            'quantity',     oi.quantity,
            'unit_price',   oi.unit_price,
            'subtotal',     oi.quantity * oi.unit_price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products    p  ON oi.product_id = p.id
    WHERE o.id = $1
    GROUP BY o.id
  `, [req.params.id]);

  if (!result.rows[0]) throw new AppError("Order not found", 404);
  res.json({ data: result.rows[0] });
});

// POST /api/v1/orders — atomic: checks stock, deducts stock, creates order
router.post("/", async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) throw new AppError(error.details[0].message, 400);

  const { user_id, items, shipping_address } = value;

  const order = await db.transaction(async (client) => {
    let totalAmount = 0;

    // Lock rows and validate stock in one pass
    for (const item of items) {
      const { rows } = await client.query(
        "SELECT * FROM products WHERE id = $1 FOR UPDATE", [item.product_id]
      );
      const product = rows[0];
      if (!product) throw new AppError(`Product ${item.product_id} not found`, 404);
      if (product.stock < item.quantity)
        throw new AppError(`Insufficient stock for "${product.name}" (${product.stock} left)`, 400);

      totalAmount     += product.price * item.quantity;
      item.unit_price  = product.price;

      await client.query(
        "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    const { rows: [newOrder] } = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, totalAmount.toFixed(2), JSON.stringify(shipping_address)]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [newOrder.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    return newOrder;
  });

  res.status(201).json({ data: order });
});

// PATCH /api/v1/orders/:id/status
router.patch("/:id/status", async (req, res) => {
  const VALID = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const { status } = req.body;

  if (!status || !VALID.includes(status))
    throw new AppError(`status must be one of: ${VALID.join(", ")}`, 400);

  const result = await db.query(
    "UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
    [status, req.params.id]
  );
  if (!result.rows[0]) throw new AppError("Order not found", 404);
  res.json({ data: result.rows[0] });
});

module.exports = router;
