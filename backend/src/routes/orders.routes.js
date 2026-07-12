const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const loadOrderHistory = async (client, orderId) => {
  const historyResult = await client.query(
    `SELECT
       id,
       order_id,
       previous_status,
       new_status,
       note,
       changed_by_user_id,
       created_at
     FROM order_status_history
     WHERE order_id = $1
     ORDER BY created_at ASC, id ASC`,
    [orderId]
  );

  return historyResult.rows;
};

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.user_id,
         o.customer_name,
         o.customer_email,
         o.customer_phone,
         o.shipping_address,
         o.shipping_latitude,
         o.shipping_longitude,
         o.payment_method,
         o.payment_status,
         o.status,
         o.total,
         o.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'productId', oi.product_id,
               'productName', oi.product_name,
               'unitPrice', oi.unit_price,
               'quantity', oi.quantity,
               'lineTotal', oi.line_total,
               'metadata', oi.metadata
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.json({ ok: true, orders: result.rows });
  } catch (error) {
    console.error('Orders list error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.user_id,
         o.customer_name,
         o.customer_email,
         o.customer_phone,
         o.shipping_address,
         o.shipping_latitude,
         o.shipping_longitude,
         o.payment_method,
         o.payment_status,
         o.status,
         o.total,
         o.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'productId', oi.product_id,
               'productName', oi.product_name,
               'unitPrice', oi.unit_price,
               'quantity', oi.quantity,
               'lineTotal', oi.line_total,
               'metadata', oi.metadata
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1 AND o.id = $2
       GROUP BY o.id`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    const order = result.rows[0];
    order.history = await loadOrderHistory(pool, order.id);

    return res.json({ ok: true, order });
  } catch (error) {
    console.error('Order detail error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load order' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const ownership = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (ownership.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    const history = await loadOrderHistory(pool, req.params.id);
    return res.json({ ok: true, history });
  } catch (error) {
    console.error('Order history error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load order history' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      items = [],
      total = 0,
      customerName = null,
      customerEmail = null,
      customerPhone = null,
      shippingAddress = null,
      shippingLatitude = null,
      shippingLongitude = null,
      paymentMethod = null,
      paymentStatus = 'pending',
      status = 'confirmed'
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Order items are required' });
    }

    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (
         user_id,
         customer_name,
         customer_email,
         customer_phone,
         shipping_address,
         shipping_latitude,
         shipping_longitude,
         payment_method,
         payment_status,
         status,
         total
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, user_id, customer_name, customer_email, customer_phone, shipping_address, shipping_latitude, shipping_longitude, payment_method, payment_status, status, total, created_at`,
      [
        req.user.id,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingLatitude,
        shippingLongitude,
        paymentMethod,
        paymentStatus,
        status,
        Number(total) || 0
      ]
    );

    const order = orderResult.rows[0];

    await client.query(
      `INSERT INTO order_status_history (
         order_id,
         previous_status,
         new_status,
         note,
         changed_by_user_id
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, null, String(order.status || 'confirmed'), 'Order created', req.user.id]
    );

    const candidateProductIds = Array.from(
      new Set(
        items
          .map((item) => {
            const rawId = item?.id;
            if (rawId === null || rawId === undefined) return null;
            const idText = String(rawId).trim();
            if (!/^\d+$/.test(idText)) return null;
            return Number(idText);
          })
          .filter((value) => Number.isInteger(value) && value > 0)
      )
    );

    let validProductIdSet = new Set();
    if (candidateProductIds.length > 0) {
      const existingProductsResult = await client.query(
        `SELECT id
         FROM products
         WHERE id = ANY($1::bigint[])`,
        [candidateProductIds]
      );

      validProductIdSet = new Set(existingProductsResult.rows.map((row) => Number(row.id)));
    }

    for (const item of items) {
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.price ?? item.unitPrice) || 0;
      const lineTotal = Number((quantity * unitPrice).toFixed(2));
      const numericId = item.id && String(item.id).match(/^\d+$/) ? Number(item.id) : null;
      const productId = numericId && validProductIdSet.has(numericId) ? numericId : null;

      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           product_name,
           unit_price,
           quantity,
           line_total,
           metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          productId,
          String(item.name || 'Unnamed Item'),
          unitPrice,
          quantity,
          lineTotal,
          JSON.stringify(item)
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ ok: true, order });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

router.put('/:id/status', async (req, res) => {
  const client = await pool.connect();

  try {
    const { status } = req.body || {};
    const nextStatus = String(status || '').trim();

    if (!nextStatus) {
      return res.status(400).json({ ok: false, error: 'Status is required' });
    }

    await client.query('BEGIN');

    const currentOrderResult = await client.query(
      `SELECT id, status
       FROM orders
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (currentOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    const previousStatus = currentOrderResult.rows[0].status;

    const result = await client.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, status, updated_at`,
      [nextStatus, req.params.id, req.user.id]
    );

    if (previousStatus !== nextStatus) {
      await client.query(
        `INSERT INTO order_status_history (
           order_id,
           previous_status,
           new_status,
           note,
           changed_by_user_id
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, previousStatus, nextStatus, 'Status updated', req.user.id]
      );
    }

    await client.query('COMMIT');

    return res.json({ ok: true, order: result.rows[0] });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    console.error('Update order status error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to update order status' });
  } finally {
    client.release();
  }
});

router.patch('/:id/address', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      shippingAddress = '',
      shippingLatitude = null,
      shippingLongitude = null
    } = req.body || {};

    const trimmedAddress = String(shippingAddress || '').trim();
    if (!trimmedAddress) {
      return res.status(400).json({ ok: false, error: 'Shipping address is required' });
    }

    await client.query('BEGIN');

    const currentOrderResult = await client.query(
      `SELECT id, status, shipping_address
       FROM orders
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (currentOrderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'Order not found' });
    }

    const currentOrder = currentOrderResult.rows[0];
    const editableStatuses = new Set(['pending', 'confirmed', 'processing']);
    if (!editableStatuses.has(String(currentOrder.status || '').toLowerCase())) {
      await client.query('ROLLBACK');
      return res.status(400).json({ ok: false, error: 'This order address can no longer be changed' });
    }

    const result = await client.query(
      `UPDATE orders
       SET shipping_address = $1,
           shipping_latitude = $2,
           shipping_longitude = $3,
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, shipping_address, shipping_latitude, shipping_longitude, updated_at`,
      [
        trimmedAddress,
        shippingLatitude === null || shippingLatitude === undefined ? null : Number(shippingLatitude),
        shippingLongitude === null || shippingLongitude === undefined ? null : Number(shippingLongitude),
        req.params.id,
        req.user.id
      ]
    );

    await client.query(
      `INSERT INTO order_status_history (
         order_id,
         previous_status,
         new_status,
         note,
         changed_by_user_id
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, currentOrder.status, currentOrder.status, `Delivery address updated from "${currentOrder.shipping_address || 'not set'}" to "${trimmedAddress}"`, req.user.id]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, order: result.rows[0] });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    console.error('Update order address error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to update order address' });
  } finally {
    client.release();
  }
});

module.exports = router;
