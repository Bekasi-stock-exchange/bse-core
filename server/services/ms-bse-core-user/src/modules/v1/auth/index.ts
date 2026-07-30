/**
 * @file src/modules/v1/auth/index.ts
 * @description Auth route group composer.
 *
 * Mounts all authentication-related Elysia service plugins under the
 * `/auth` prefix. Each service plugin is self-contained — it owns its
 * route definition, body schema, and handler logic.
 *
 * Resulting routes (relative to /api/v1):
 *   POST /auth/register  — Create a new user account
 *   POST /auth/login     — Authenticate and receive tokens
 *   POST /auth/refresh   — Rotate a refresh token
 *   POST /auth/logout    — Revoke the current refresh token
 */

import { Elysia } from "elysia";
import { registerService } from "./services/register.service";
import { loginService } from "./services/login.service";
import { refreshService } from "./services/refresh.service";
import { logoutService } from "./services/logout.service";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(registerService)
  .use(loginService)
  .use(refreshService)
  .use(logoutService)
  .as("scoped");
