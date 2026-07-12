// Vercel serverless entry: hosts the entire Express API (products, auth,
// orders). vercel.json rewrites /api/*, /auth/* and /orders* here with the
// original path carried in the __path query param, so routing does not
// depend on how Vercel treats req.url across rewrites.
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
    const match = /[?&]__path=([^&]*)/.exec(req.url);
    if (match) {
      // Reconstruct the original request URL from the rewrite's __path param
      // plus any remaining query string.
      const rest = req.url
        .slice(req.url.indexOf("?") + 1)
        .split("&")
        .filter((kv: string) => kv && !kv.startsWith("__path="))
        .join("&");
      req.url = "/" + decodeURIComponent(match[1]) + (rest ? "?" + rest : "");
    }
    // If the platform preserved the original URL instead, strip the /api
    // prefix that rewrites add for /auth and /orders routes.
    req.url = req.url.replace(/^\/api(?=\/(auth|orders)(\/|\?|$))/, "");
  }
  return app(req, res);
}
