---
name: Shared external DB startup
description: Constraints when the API runs schema setup against the owner's shared Postgres
---
The API prefers STORE_DATABASE_URL (owner's shared Neon Postgres, also read/written by their separate fleet-admin app) and runs idempotent schema+seed on startup.

**Why:** Concurrent server starts once deadlocked on the startup migration (UPDATE inside a DO block); a pg advisory lock now serializes schema setup — keep any new startup DDL/DML inside that locked path.

**How to apply:** When adding startup migrations or changing pool config, keep them inside the advisory-locked setup and keep the schema compatible with the admin app reading the same tables.

Shared-schema constraints (admin app owns these tables — additive changes only):
- `users.id` is VARCHAR (no default) and `users.company_id` is NOT NULL. Storefront code must generate ids (`gen_random_uuid()::text`) and always set `company_id` to the dedicated `storefront-buyers` company row (created during schema setup if the `companies` table exists).
- All storefront FKs to users (`orders.user_id`, `order_status_history.changed_by_user_id`) must be VARCHAR, not BIGINT.
- Do not add unique constraints or `ON CONFLICT` targets on admin-owned tables (e.g. users.email uniqueness is not guaranteed there); check existence with SELECT first.
