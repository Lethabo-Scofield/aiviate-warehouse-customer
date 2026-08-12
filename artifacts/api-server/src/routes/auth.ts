import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../lib/pool";
import { STOREFRONT_COMPANY_ID } from "../db/legacy-schema";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, company, phone, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Name, email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(String(password), 10);

    // The shared users table has no unique constraint on email, so serialize
    // the check-then-insert per email with a transaction-scoped advisory lock.
    const client = await pool.connect();
    let user;
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [normalizedEmail]);

      const existing = await client.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
      if (existing.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ ok: false, error: "Email already registered" });
      }

      const insertResult = await client.query(
        `INSERT INTO users (id, name, company, phone, email, password_hash, role, company_id)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 'buyer', $6)
         RETURNING id, name, company, phone, email, role, created_at`,
        [String(name), company || null, phone || null, normalizedEmail, passwordHash, STOREFRONT_COMPANY_ID]
      );
      await client.query("COMMIT");
      user = insertResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
    const token = signToken(user);

    return res.status(201).json({ ok: true, token, user });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ ok: false, error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, company, phone, email, role, created_at, password_hash
       FROM users
       WHERE email = $1
       ORDER BY created_at ASC NULLS LAST
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const dbUser = result.rows[0];
    const valid = await bcrypt.compare(String(password), dbUser.password_hash);

    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const { password_hash, ...user } = dbUser;
    const token = signToken(user);

    return res.json({ ok: true, token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ ok: false, error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, company, phone, email, role, created_at
       FROM users
       WHERE id = $1`,
      [(req as any).user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ ok: false, error: "Failed to load user profile" });
  }
});

export default router;
