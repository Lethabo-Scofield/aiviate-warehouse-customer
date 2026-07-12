import { pool } from "../lib/pool";

export const createSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'buyer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image_url TEXT,
      category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      shipping_address TEXT,
      shipping_latitude NUMERIC(9, 6),
      shipping_longitude NUMERIC(9, 6),
      payment_method TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'confirmed',
      total NUMERIC(10, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Backward compatibility for older deployments that already created a legacy orders table.
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id BIGINT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_latitude NUMERIC(9, 6)`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_longitude NUMERIC(9, 6)`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2) DEFAULT 0`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);

  // Compatibility for legacy schema where orders.items was required.
  await pool.query(`
    DO $$
    DECLARE
      items_udt TEXT;
      items_data_type TEXT;
    BEGIN
      SELECT c.udt_name, c.data_type
      INTO items_udt, items_data_type
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = 'orders'
        AND c.column_name = 'items';

      IF FOUND THEN
        IF items_udt = 'jsonb' THEN
          EXECUTE 'UPDATE orders SET items = COALESCE(items, ''[]''::jsonb)';
          EXECUTE 'ALTER TABLE orders ALTER COLUMN items SET DEFAULT ''[]''::jsonb';
        ELSIF items_udt = 'json' THEN
          EXECUTE 'UPDATE orders SET items = COALESCE(items, ''[]''::json)';
          EXECUTE 'ALTER TABLE orders ALTER COLUMN items SET DEFAULT ''[]''::json';
        ELSE
          EXECUTE 'UPDATE orders SET items = COALESCE(items, ''[]'')';
          EXECUTE 'ALTER TABLE orders ALTER COLUMN items SET DEFAULT ''[]''';
        END IF;

        EXECUTE 'ALTER TABLE orders ALTER COLUMN items DROP NOT NULL';
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'orders_user_id_fkey'
          AND table_name = 'orders'
      ) THEN
        ALTER TABLE orders
          ADD CONSTRAINT orders_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      unit_price NUMERIC(10, 2) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      line_total NUMERIC(10, 2) NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      note TEXT,
      changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Backfill one history row for older orders so existing data remains visible in history.
  await pool.query(`
    INSERT INTO order_status_history (order_id, previous_status, new_status, note, changed_by_user_id, created_at)
    SELECT o.id, NULL, COALESCE(NULLIF(o.status, ''), 'confirmed'), 'Initial status (backfilled)', o.user_id, COALESCE(o.created_at, NOW())
    FROM orders o
    WHERE NOT EXISTS (
      SELECT 1
      FROM order_status_history osh
      WHERE osh.order_id = o.id
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC)');
};
