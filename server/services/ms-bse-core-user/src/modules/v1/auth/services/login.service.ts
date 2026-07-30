/**
 * @file src/modules/v1/auth/services/login.service.ts
 * @description POST /auth/login — Credential authentication and token issuance.
 *
 * Flow:
 *  1. Look up the user by username or email (the `identifier` field)
 *  2. Verify the provided password against the stored Argon2id hash
 *  3. Sign a short-lived JWT access token (5 minutes) with @elysiajs/jwt
 *  4. Generate a 48-byte cryptographically random refresh token
 *  5. Hash the refresh token with SHA-256 and persist the hash to `userTokens`
 *  6. Send the raw refresh token to the client as an httpOnly cookie (7 days)
 *
 * Responses:
 *  200 — { accessToken, expiresIn, user } + Set-Cookie: refreshToken (httpOnly)
 *  401 — Invalid credentials or inactive account
 *  403 — Account deactivated
 *  500 — Unexpected server error
 *
 * Security notes:
 *  - Only the SHA-256 hash of the refresh token is stored in the DB; the raw
 *    value is never persisted, so a DB compromise cannot replay the token.
 *  - The `secure` flag on the cookie is set only in production (NODE_ENV=production).
 *  - Access tokens expire after 5 minutes; clients must use /refresh to rotate.
 */

import { Elysia, t } from "elysia";
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

export const loginService = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: `${ACCESS_TOKEN_TTL_SEC}s`,
    })
  )
  .post(
    "/login",
    async ({ body, jwt, cookie: { refreshToken }, set }) => {
      try {
        const { identifier, password } = body;

        // 1. Locate user by username or email
        logger.info({ identifier }, "Login attempt");
        const user =
          (await UserModel.findByUsername(identifier)) ??
          (await UserModel.findByEmail(identifier));

        if (!user) {
          logger.warn({ identifier }, "Login failed: Invalid credentials (user not found)");
          set.status = 401;
          return ResponseHandler.error(401, "Invalid credentials");
        }

        if (!user.isActive) {
          logger.warn({ identifier, userId: user.id }, "Login failed: Account deactivated");
          set.status = 403;
          return ResponseHandler.error(403, "Account is deactivated");
        }

        // 2. Verify password against stored Argon2id hash
        const valid = await Bun.password.verify(password, user.password);
        if (!valid) {
          logger.warn({ identifier, userId: user.id }, "Login failed: Invalid credentials (wrong password)");
          set.status = 401;
          return ResponseHandler.error(401, "Invalid credentials");
        }

        // 3. Sign JWT access token (5 min expiry baked into the jwt plugin config)
        const accessToken = await jwt.sign({
          sub: user.id,
          username: user.username,
        });

        // 4. Generate refresh token, hash it, persist the hash
        const rawRefreshToken = randomBytes(48).toString("hex");
        const hashedToken = hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await UserModel.storeRefreshToken(user.id, hashedToken, expiresAt);

        // 5. Set the raw token in an httpOnly cookie — only the hash lives in the DB
        refreshToken.set({
          value: rawRefreshToken,
          httpOnly: true,
          secure: IS_PRODUCTION,  // HTTPS only in production
          sameSite: "strict",
          path: "/",
          maxAge: REFRESH_TOKEN_TTL_MS / 1000,
        });

        logger.info({ userId: user.id, username: user.username }, "User logged in successfully");
        return ResponseHandler.success(
          {
            accessToken,
            expiresIn: ACCESS_TOKEN_TTL_SEC,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
            },
          },
          200
        );
      } catch (error: any) {
        logger.error({ identifier: body.identifier, error: error.message }, "Login encountered an error");
        set.status = 500;
        return ResponseHandler.error(500, error.message);
      }
    },
    {
      body: t.Object({
        /** Username or email address */
        identifier: t.String({ minLength: 1 }),
        /** Plain-text password */
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .as("scoped");
