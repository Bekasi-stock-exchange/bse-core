/**
 * @file src/modules/v1/auth/services/logout.service.ts
 * @description POST /auth/logout — Refresh token revocation.
 *
 * Flow:
 *  1. Read the raw refresh token from the httpOnly `refreshToken` cookie
 *  2. If present, SHA-256 hash it and delete the matching row from `userTokens`
 *  3. Clear the cookie by setting maxAge=0 regardless of whether a DB row existed
 *
 * Responses:
 *  200 — Logout successful (cookie cleared)
 *  500 — Unexpected server error
 *
 * Notes:
 *  - The endpoint is idempotent: calling it with an already-expired or absent
 *    cookie still returns 200 (the cookie is cleared either way).
 *  - No authentication is required — a client with a stale or missing cookie
 *    can still hit this endpoint to ensure a clean logout state.
 */

import { Elysia } from "elysia";
import { ResponseHandler, hashToken, logger } from "@bse/utils";
import { UserModel } from "../../../../models/UserModel";

export const logoutService = new Elysia().post(
  "/logout",
  async ({ cookie: { refreshToken }, set }) => {
    try {
      const rawToken = refreshToken.value as string | undefined;

      if (rawToken) {
        // Hash the raw token to match the stored hash and delete it
        const hashedToken = hashToken(rawToken);
        await UserModel.deleteRefreshToken(hashedToken);
        logger.info("User logged out, refresh token revoked");
      } else {
        logger.info("User logged out, no refresh token provided");
      }

      // Always clear the cookie, even if no DB row was found
      refreshToken.set({
        value: "",
        httpOnly: true,
        maxAge: 0,
        path: "/",
      });

      return ResponseHandler.success(null, 200);
    } catch (error: any) {
      logger.error({ error: error.message }, "Logout error");
      set.status = 500;
      return ResponseHandler.error(500, error.message);
    }
  }
);
