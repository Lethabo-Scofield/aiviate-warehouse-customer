import pg from "pg";

const { Pool } = pg;

// Prefer the store's shared database (used by the admin side to read the
// same orders tables); fall back to the built-in Replit database.
const databaseUrl =
  process.env.STORE_DATABASE_URL || process.env.DATABASE_URL || "";

if (!databaseUrl) {
  throw new Error(
    "Missing STORE_DATABASE_URL or DATABASE_URL in environment variables"
  );
}

const shouldUseSsl =
  !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});
