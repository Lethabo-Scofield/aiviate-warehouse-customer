const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, company, phone, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const insertResult = await pool.query(
      `INSERT INTO users (name, company, phone, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, company, phone, email, role, created_at`,
      [String(name), company || null, phone || null, normalizedEmail, passwordHash]
    );

    const user = insertResult.rows[0];
    const token = signToken(user);

    return res.status(201).json({ ok: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ ok: false, error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, company, phone, email, role, created_at, password_hash
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    const dbUser = result.rows[0];
    const valid = await bcrypt.compare(String(password), dbUser.password_hash);

    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    const { password_hash, ...user } = dbUser;
    const token = signToken(user);

    return res.json({ ok: true, token, user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, company, phone, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load user profile' });
  }
});

module.exports = router;
