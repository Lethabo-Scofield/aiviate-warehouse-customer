---
name: Shared external DB startup
description: Constraints when the API runs schema setup against the owner's shared Postgres
---
The API prefers STORE_DATABASE_URL (owner's shared Postgres, also read by their separate admin app) and runs idempotent schema+seed on startup.

**Why:** Concurrent server starts once deadlocked on the startup migration (UPDATE inside a DO block); a pg advisory lock now serializes schema setup — keep any new startup DDL/DML inside that locked path.

**How to apply:** When adding startup migrations or changing pool config, keep them inside the advisory-locked setup and remember the schema must stay compatible with the admin app reading the same tables.
