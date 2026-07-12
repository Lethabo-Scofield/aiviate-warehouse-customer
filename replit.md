# BulkMart Pro

Single-user wholesale grocery storefront: the store opens directly (no login screen — the app silently signs in with a built-in store account), the buyer browses a bulk product catalog, adds to cart, checks out with a map-based address picker and simulated payment, and tracks order history. Orders are written to the owner's shared external database so a separate admin app can read the same tables.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/warehouse-ecommerce run dev` — run the web frontend (Vite)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `STORE_DATABASE_URL` — the owner's shared Postgres database (preferred; also read by their admin app); falls back to `DATABASE_URL` (built-in Replit DB). `JWT_SECRET` or `SESSION_SECRET` required in production (JWT signing)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, JSX (ported from CRA), Tailwind via CDN in index.html
- API: Express 5
- DB: PostgreSQL via `pg` Pool (raw SQL, ported schema); Drizzle ORM scaffold still present
- Auth: JWT (jsonwebtoken) + bcryptjs
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/warehouse-ecommerce/src/` — ported CRA frontend (`.jsx` files, no router; view switching is state-based in `App.jsx`)
- `artifacts/api-server/src/routes/` — auth, products, categories, orders, images (verbatim ports from the original Express backend)
- `artifacts/api-server/src/db/legacy-schema.ts` + `legacy-seed.ts` — SQL schema creation and product seeding, run on server startup
- `artifacts/api-server/src/lib/pool.ts` — pg Pool; `lib/legacy-env.ts` — JWT secret resolution
- `.migration-backup/` — original imported Vercel project (CRA frontend + Express backend), kept for reference

## Architecture decisions

- Migration-parity port: original code kept verbatim where possible, typed loosely (`any`) — strict typecheck intentionally out of scope
- Frontend calls same-origin URLs (`/api`, `/auth`, `/orders`); API server artifact routes those paths via artifact config
- DB schema/seed run automatically before the server listens (matches original server.js behavior)
- Tailwind + FontAwesome load from CDN in `index.html`, matching the original app's styling exactly

## Product

- Open storefront (no login UI): frontend auto-signs-in with the store account (demo@bulkmart.com, seeded on startup); backend JWT auth routes still exist and are used silently
- Product catalog with search and category filters, cart, checkout with leaflet map address picker, simulated payment modal, order history with status timeline

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API writes to the external `STORE_DATABASE_URL` database; schema create + seed run on startup against it (idempotent, IF NOT EXISTS). Concurrent server starts can deadlock on the startup migration — restart once if that happens.
- Orders placed by the open storefront belong to the seeded store user; the admin side reads the same `orders`/`order_items` tables.

- Legacy endpoints use raw SQL against tables created by `legacy-schema.ts`, not the Drizzle schema in `@workspace/db`
- `/auth` and `/orders` are mounted at the root (not under `/api`) — artifact service paths must include them
- Frontend is `.jsx` and excluded from strict typechecking; don't run root-level typecheck expecting it to cover the ported UI

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
