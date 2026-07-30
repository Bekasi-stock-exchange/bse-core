/**
 * @file src/modules/v1/index.ts
 * @description API v1 route group.
 *
 * Mounts all v1 feature route groups under the `/api/v1` prefix.
 * Add new feature route groups here as the service grows.
 */

import { Elysia } from "elysia";
import { authRoutes } from "./auth";

/** All routes under /api/v1 */
export const v1Routes = new Elysia({ prefix: "/api/v1" })
  .use(authRoutes);
