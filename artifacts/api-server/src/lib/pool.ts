import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

const shouldUseSsl =
  !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});
