const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const pool = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const categoryRoutes = require('./routes/categories.routes');
const orderRoutes = require('./routes/orders.routes');
const imageRoutes = require('./routes/images.routes');

const app = express();

app.use(cors({ origin: env.frontendOrigin === '*' ? true : env.frontendOrigin }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Endpoint not found' });
});

module.exports = app;
