import { Router, type IRouter } from "express";
import { pool } from "../lib/pool";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, created_at
       FROM categories
       ORDER BY name ASC`
    );

    return res.json({ ok: true, categories: result.rows });
  } catch (error) {
    console.error("Categories error:", error);
    return res.status(500).json({ ok: false, error: "Failed to load categories" });
  }
});

export default router;
