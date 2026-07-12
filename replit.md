# BulkMart Pro

Wholesale grocery e-commerce app: buyers register, browse a bulk product catalog, add to cart, check out with a map-based address picker and simulated payment, and track order history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/warehouse-ecommerce run dev` — run the web frontend (Vite)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string; `JWT_SECRET` or `SESSION_SECRET` required in production (JWT signing)

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

- Buyer registration/login (JWT), product catalog with search and category filters, cart, checkout with leaflet map address picker, simulated payment modal, order history with status timeline

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Legacy endpoints use raw SQL against tables created by `legacy-schema.ts`, not the Drizzle schema in `@workspace/db`
- `/auth` and `/orders` are mounted at the root (not under `/api`) — artifact service paths must include them
- Frontend is `.jsx` and excluded from strict typechecking; don't run root-level typecheck expecting it to cover the ported UI

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
