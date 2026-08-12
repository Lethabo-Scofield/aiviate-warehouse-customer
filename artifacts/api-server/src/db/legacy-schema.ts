import { pool } from "../lib/pool";

// Serializes startup schema setup across concurrently starting server
// instances (shared external DB) to avoid migration deadlocks.
const SCHEMA_SETUP_LOCK_KEY = 727274001;

export const createSchema = async () => {
  const lockClient = await pool.connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [
      SCHEMA_SETUP_LOCK_KEY,
    ]);
    await runSchemaSetup();
  } finally {
    try {
      await lockClient.query("SELECT pg_advisory_unlock($1)", [
        SCHEMA_SETUP_LOCK_KEY,
      ]);
    } finally {
      lockClient.release();
    }
  }
};

// Company id used for storefront-registered buyers in the shared database
// (users.company_id is NOT NULL there and is read by the owner's admin app).
export const STOREFRONT_COMPANY_ID = "storefront-buyers";

const runSchemaSetup = async () => {
  // The shared store database (admin app) already defines users with
  // VARCHAR ids and a required company_id. Match that shape on fresh DBs.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email VARCHAR UNIQUE NOT NULL,
      password_hash VARCHAR NOT NULL,
      name VARCHAR NOT NULL,
      role VARCHAR DEFAULT 'buyer',
      company_id VARCHAR NOT NULL DEFAULT '${STOREFRONT_COMPANY_ID}',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Additive columns the storefront uses; safe no-ops on the shared DB.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
  );

  // Ensure the storefront's company row exists when the shared companies
  // table is present (users.company_id references it logically).
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'companies'
      ) THEN
        IF NOT EXISTS (SELECT 1 FROM companies WHERE id = '${STOREFRONT_COMPANY_ID}') THEN
          INSERT INTO companies (id, name, created_at)
          VALUES ('${STOREFRONT_COMPANY_ID}', 'BulkMart Storefront Buyers', NOW());
        END IF;
      END IF;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping storefront company seed: %', SQLERRM;
    END $$;
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
      user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id VARCHAR`);
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

  // Fail fast if a legacy orders table has an ID type incompatible with
  // users.id — silently skipping the FK would let order inserts fail later.
  await pool.query(`
    DO $$
    DECLARE
      orders_type TEXT;
      users_type TEXT;
    BEGIN
      SELECT c.udt_name INTO orders_type
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = 'orders' AND c.column_name = 'user_id';

      SELECT c.udt_name INTO users_type
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = 'users' AND c.column_name = 'id';

      IF orders_type IS DISTINCT FROM users_type
         AND NOT (orders_type IN ('varchar', 'text') AND users_type IN ('varchar', 'text')) THEN
        RAISE EXCEPTION
          'orders.user_id type (%) is incompatible with users.id type (%); manual migration required',
          orders_type, users_type;
      END IF;

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
      changed_by_user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
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
