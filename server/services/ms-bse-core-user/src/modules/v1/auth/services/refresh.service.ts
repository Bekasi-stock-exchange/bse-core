/**
 * @file src/modules/v1/auth/services/refresh.service.ts
 * @description POST /auth/refresh — Refresh token rotation.
 *
 * Flow:
 *  1. Read the raw refresh token from the httpOnly `refreshToken` cookie
 *  2. SHA-256 hash the incoming raw token to look it up in `userTokens`
 *  3. Validate that the token row exists and has not expired
 *  4. Fetch the associated user and confirm the account is still active
 *  5. Delete the old token row (one-time use — prevents replay)
 *  6. Issue a new JWT access token and a new refresh token (full rotation)
 *  7. Persist the new hashed refresh token and update the cookie
 *
 * Responses:
 *  200 — { accessToken, expiresIn } + refreshed Set-Cookie: refreshToken
 *  401 — Missing cookie, invalid token, or expired token
 *  500 — Unexpected server error
 *
 * Security notes:
 *  - Refresh tokens are single-use; each call rotates both tokens.
 *  - Only the SHA-256 hash is stored in the DB; the raw value lives exclusively
 *    in the client cookie, making DB-level token theft non-exploitable.
 */

import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { randomBytes } from "crypto";
import { ResponseHandler, hashToken, logger } from "@bse/utils";
import { UserModel } from "../../../../models/UserModel";

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

/** Access token TTL: 5 minutes in seconds */
const ACCESS_TOKEN_TTL_SEC = 5 * 60;

/** Refresh token TTL: 7 days in milliseconds */
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const refreshService = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: `${ACCESS_TOKEN_TTL_SEC}s`,
    })
  )
  .post("/refresh", async ({ jwt, cookie: { refreshToken }, set }) => {
    try {
      // 1. Read raw token from cookie
      const rawToken = refreshToken.value as string | undefined;

      if (!rawToken) {
        logger.warn("Refresh token attempt without token");
        set.status = 401;
        return ResponseHandler.error(401, "No refresh token provided");
      }

      // 2. Hash the incoming token and look it up in the DB
      const hashedToken = hashToken(rawToken);
      const tokenRow = await UserModel.findRefreshToken(hashedToken);

      if (!tokenRow) {
        logger.warn({ hashedToken }, "Invalid token: token not found");
        set.status = 401;
        return ResponseHandler.error(401, "Invalid refresh token");
      }

      if (!tokenRow.isActive) {
        // TOKEN REUSE DETECTED! (Potential MITM)
        logger.warn(
          { userId: tokenRow.idUser, hashedToken },
          "MITM attack detected: refresh token reuse!"
        );
        // Invalidate all tokens for this user
        await UserModel.revokeAllUserTokens(tokenRow.idUser);
        set.status = 401;
        return ResponseHandler.error(401, "Invalid refresh token");
      }

      // 3. Reject expired tokens and clean them up
      if (new Date() > tokenRow.expiresAt) {
        logger.info({ userId: tokenRow.idUser }, "Refresh token has expired");
        await UserModel.deleteRefreshToken(hashedToken);
        set.status = 401;
        return ResponseHandler.error(401, "Refresh token has expired");
      }

      // 4. Ensure the associated user still exists and is active
      const user = await UserModel.findById(tokenRow.idUser);
      if (!user || !user.isActive) {
        logger.warn({ userId: tokenRow.idUser }, "Refresh token failed: User not found or inactive");
        set.status = 401;
        return ResponseHandler.error(401, "User not found or inactive");
      }

      // 5. Invalidate the old token before issuing a new pair (rotation)
      await UserModel.deleteRefreshToken(hashedToken);

      // 6. Issue new access token
      const newAccessToken = await jwt.sign({
        sub: user.id,
        username: user.username,
      });

      // 7. Issue new refresh token, hash and persist it, update the cookie
      const newRawRefreshToken = randomBytes(48).toString("hex");
      const newHashedToken = hashToken(newRawRefreshToken);
      const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

      await UserModel.storeRefreshToken(user.id, newHashedToken, newExpiresAt);

      refreshToken.set({
        value: newRawRefreshToken,
        httpOnly: true,
        secure: IS_PRODUCTION,  // HTTPS only in production
        sameSite: "strict",
        path: "/",
        maxAge: REFRESH_TOKEN_TTL_MS / 1000,
      });

      logger.info({ userId: user.id }, "Refresh token rotated successfully");

      return ResponseHandler.success(
        {
          accessToken: newAccessToken,
          expiresIn: ACCESS_TOKEN_TTL_SEC,
        },
        200
      );
    } catch (error: any) {
      logger.error({ error: error.message }, "Refresh token error");
      set.status = 500;
      return ResponseHandler.error(500, error.message);
    }
  })
  .as("scoped");
