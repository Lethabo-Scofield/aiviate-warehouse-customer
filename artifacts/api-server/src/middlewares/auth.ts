import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { legacyEnv } from "../lib/legacy-env";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Missing auth token" });
  }

  try {
    (req as any).user = jwt.verify(token, legacyEnv.jwtSecret);
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, error: "Invalid or expired token" });
  }
};
