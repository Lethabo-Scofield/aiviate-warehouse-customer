// Vercel serverless catch-all: hosts the Express API (products, auth, orders).
// /api/* routes here natively; vercel.json rewrites /auth/* and /orders* to
// /api/auth/* and /api/orders* so they land here too. The Express app mounts
// routes at /auth, /orders and /api, so we strip the /api prefix that the
// rewrite added for those two.
import app from "../artifacts/api-server/src/app";
import { createSchema } from "../artifacts/api-server/src/db/legacy-schema";
import { seedDatabase } from "../artifacts/api-server/src/db/legacy-seed";

let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await createSchema();
      await seedDatabase();
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: any, res: any) {
  await ensureReady();
  if (typeof req.url === "string") {
    req.url = req.url.replace(/^\/api(?=\/(auth|orders)(\/|\?|$))/, "");
  }
  return (app as unknown as (req: any, res: any) => void)(req, res);
}
