/**
 * @file src/middlewares/useAuth.ts
 * @description JWT Bearer token verification middleware.
 *
 * Provides the `useAuth` Elysia plugin, which:
 *  - Reads the `Authorization: Bearer <token>` header
 *  - Verifies the JWT signature using `jose` (direct, no @elysiajs/jwt decorator)
 *  - Injects the decoded payload as `user` into the request context
 *
 * Using `jose` directly (rather than the @elysiajs/jwt plugin) keeps the exported
 * const type portable — it avoids leaking jose's internal types into parent plugins.
 *
 * ## Lifecycle
 * The middleware operates in two phases:
 *  1. **resolve** — Attempts to parse and verify the Bearer token. On success it
 *     injects `{ user, authError: null }` into the context; on failure it injects
 *     `{ user: null, authError: <reason> }`. This phase never short-circuits the
 *     request so that Elysia's type system and Eden Treaty stay intact.
 *  2. **onBeforeHandle** — Inspects `authError`/`user` and immediately returns a
 *     401 response when authentication failed, stopping further handler execution.
 *
 * ## Usage
 * ```ts
 * import { useAuth } from "../middlewares/useAuth";
 *
 * new Elysia()
 *   .use(useAuth)
 *   .get("/protected", ({ user }) => `Hello ${user.username}`)
 * ```
 *
 * ## Error responses (standard ResponseHandler format)
 *  - `401` — Missing or malformed `Authorization` header
 *  - `401` — Invalid or expired JWT
 */

import { Elysia } from "elysia";
import { jwtVerify } from "jose";
import { createSecretKey } from "crypto";
import { ResponseHandler } from "../handlers/responseHandler";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

/**
 * Pre-computed secret key for JWT verification.
 * Created once at module load to avoid re-allocating on every request.
 */
const secretKey = createSecretKey(Buffer.from(JWT_SECRET));

/**
 * Shape of the decoded JWT payload injected as `ctx.user` by `useAuth`.
 */
export interface JwtPayload {
  /** User UUID (the `sub` claim) */
  sub: string;
  /** User's unique login handle */
  username: string;
  /** Issued-at timestamp (Unix seconds) */
  iat: number;
  /** Expiry timestamp (Unix seconds) */
  exp: number;
}

export const useAuth = new Elysia({ name: "use-auth" })
  /**
   * Phase 1 — Token parsing.
   *
   * Always resolves (never throws) so Elysia's type inference and Eden Treaty
   * remain intact. The result is merged into every downstream handler's context:
   *  - `user`      — decoded JWT payload, or `null` when auth fails
   *  - `authError` — human-readable failure reason, or `null` on success
   */
  .resolve(async ({ headers }) => {
    const authHeader = headers["authorization"];

    // No Bearer token present — bail out early with a descriptive error
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        user: null as JwtPayload | null,
        authError: "Missing or malformed Authorization header" as string | null,
      };
    }

    // Strip the "Bearer " prefix to obtain the raw token string
    const token = authHeader.slice(7);

    try {
      // Verify signature and expiry; jose throws on any failure (expired, tampered, etc.)
      const { payload } = await jwtVerify(token, secretKey);

      // Explicitly map jose's loosely-typed JWTPayload to our strict JwtPayload.
      // jose types all claims as optional/unknown, so we extract each field we
      // care about rather than using a blanket `as unknown as JwtPayload` cast.
      const user: JwtPayload = {
        sub:      payload.sub      as string,
        username: payload["username"] as string,
        iat:      payload.iat      as number,
        exp:      payload.exp      as number,
      };

      return { user, authError: null as string | null };
    } catch {
      // Token is malformed, expired, or the signature does not match
      return {
        user: null as JwtPayload | null,
        authError: "Invalid or expired access token" as string | null,
      };
    }
  })
  /**
   * Phase 2 — Access gate.
   *
   * Returning a value from `onBeforeHandle` short-circuits the request lifecycle,
   * so the actual route handler is never called when auth has failed.
   */
  .onBeforeHandle(({ user, authError, set }) => {
    if (authError || !user) {
      set.status = 401;
      return ResponseHandler.error(401, authError ?? "Unauthorized");
    }
  })
  .as("scoped");
