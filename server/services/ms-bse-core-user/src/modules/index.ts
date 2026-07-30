/**
 * @file src/modules/index.ts
 * @description Root Elysia application assembly.
 *
 * Composes all global plugins and route groups into the single `app` instance:
 *  - `docs`           — Swagger UI (enabled only when ENABLE_DOCS=true)
 *  - `useApiKey`        — Enforces X-API-Key header on all routes
 *  - `errorHandler`   — Centralised error-to-response mapping
 *  - `v1Routes`       — All versioned API routes under /api/v1
 */

import { Elysia } from "elysia";
import { docs } from "@bse/swagger";
import { useApiKey, errorHandler } from "@bse/utils";
import { v1Routes } from "./v1";

const app = new Elysia()
  .use(docs)
  .use(useApiKey)
  .use(errorHandler)
  .use(v1Routes);

export default app;
