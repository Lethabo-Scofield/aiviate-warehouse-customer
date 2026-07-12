const pool = require('../src/config/db');

async function run() {
  try {
    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(1) FROM orders) AS orders_count,
        (SELECT COUNT(1) FROM order_status_history) AS history_count,
        (SELECT COUNT(1)
         FROM orders o
         WHERE NOT EXISTS (
           SELECT 1 FROM order_status_history h WHERE h.order_id = o.id
         )) AS orders_without_history
    `);

    const summary = counts.rows[0];
    console.log('Order summary:', summary);

    const recent = await pool.query(`
      SELECT
        o.id,
        o.status,
        o.created_at,
        (SELECT COUNT(1) FROM order_status_history h WHERE h.order_id = o.id) AS history_rows
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    console.table(recent.rows);
  } catch (error) {
    console.error('Verification error:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
