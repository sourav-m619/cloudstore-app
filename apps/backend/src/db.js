const { Pool } = require("pg");
const logger   = require("./utils/logger");

const pool = new Pool({
  host:                   process.env.DB_HOST     || "localhost",
  port:               parseInt(process.env.DB_PORT || "5432"),
  database:               process.env.DB_NAME     || "appdb",
  user:                   process.env.DB_USER     || "appuser",
  password:               process.env.DB_PASSWORD,
  max:                    20,
  idleTimeoutMillis:      30000,
  connectionTimeoutMillis: 3000,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  logger.error("Unexpected DB pool error", { error: err.message });
});

const db = {
  async connect() {
    const client = await pool.connect();
    client.release();
    logger.info("DB pool ready", {
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
    });
  },

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const ms = Date.now() - start;
      if (ms > 1000) logger.warn("Slow query", { text: text.slice(0, 80), ms });
      return result;
    } catch (err) {
      logger.error("Query error", { text: text.slice(0, 80), error: err.message });
      throw err;
    }
  },

  // Atomic multi-step operations — if anything fails, everything rolls back
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async migrate() {
    // Create tables if they don't exist yet
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(255)  NOT NULL,
        email         VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255)  NOT NULL,
        role          VARCHAR(50)   DEFAULT 'customer',
        created_at    TIMESTAMPTZ   DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255)  NOT NULL,
        description TEXT,
        price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        stock       INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category    VARCHAR(100),
        image_url   TEXT,
        created_at  TIMESTAMPTZ   DEFAULT NOW(),
        updated_at  TIMESTAMPTZ   DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status           VARCHAR(50)   DEFAULT 'pending'
          CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
        total_amount     DECIMAL(10,2) NOT NULL,
        shipping_address JSONB,
        created_at       TIMESTAMPTZ   DEFAULT NOW(),
        updated_at       TIMESTAMPTZ   DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id  UUID          NOT NULL REFERENCES products(id),
        quantity    INTEGER       NOT NULL CHECK (quantity > 0),
        unit_price  DECIMAL(10,2) NOT NULL,
        created_at  TIMESTAMPTZ   DEFAULT NOW()
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
      CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
    `);

    // Seed products only if table is empty
    await this.query(`
      INSERT INTO products (name, description, price, stock, category, image_url)
      SELECT * FROM (VALUES
        ('Cloud Laptop Pro',
         'High-performance laptop built for cloud developers',
         1299.99, 50, 'Electronics',
         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
        ('Mechanical Keyboard',
         'Tactile switches for the perfect typing experience',
         149.99, 200, 'Accessories',
         'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'),
        ('4K Monitor',
         '27-inch UHD display with HDR support and USB-C',
         599.99, 30, 'Electronics',
         'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
        ('Wireless Mouse',
         'Ergonomic design with 3-month battery life',
         79.99, 0, 'Accessories',
         'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
        ('USB-C Hub',
         '7-in-1 hub with 4K HDMI and 100W Power Delivery',
         49.99, 300, 'Accessories',
         'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400'),
        ('Noise-Cancelling Headphones',
         'Studio-quality sound for deep focus work',
         249.99, 75, 'Audio',
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400')
      ) AS v(name, description, price, stock, category, image_url)
      WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
    `);
  },

  async disconnect() {
    await pool.end();
    logger.info("DB pool closed");
  },
};

module.exports = db;
