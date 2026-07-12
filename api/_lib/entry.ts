// Bundle entry: esbuild compiles this (plus the whole Express app graph)
// into a single self-contained CommonJS file at build time (see vercel.json
// buildCommand), so the serverless function has no cross-package module
// format issues at runtime.
import app from "../../artifacts/api-server/src/app";
import { createSchema } from "../../artifacts/api-server/src/db/legacy-schema";
import { seedDatabase } from "../../artifacts/api-server/src/db/legacy-seed";

export { app, createSchema, seedDatabase };
