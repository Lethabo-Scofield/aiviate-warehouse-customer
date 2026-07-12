// Vercel serverless catch-all: hosts the Express API (products, auth, orders).
// /api/* routes here natively; vercel.json rewrites /auth/* and /orders* to
// /api/auth/* and /api/orders* so they land here too. The Express app mounts
// routes at /auth, /orders and /api, so we strip the /api prefix that the
// rewrite added for those two.
//
// The server code is pre-bundled into ./_lib/server-bundle.cjs by the
// buildCommand in vercel.json (esbuild, single CJS file) to avoid ESM/CJS
// module-format conflicts between the monorepo packages and this function.
declare function require(id: string): any;

const bundle = require("./_lib/server-bundle.cjs");
const app = bundle.app;
const createSchema = bundle.createSchema;
const seedDatabase = bundle.seedDatabase;

let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await createSchema();
      await seedDatabase();
    })().catch((err: unknown) => {
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
  return app(req, res);
}
