/**
 * @file src/modules/v1/auth/services/register.service.ts
 * @description POST /auth/register — New user registration.
 *
 * Flow:
 *  1. Validate request body (username, email?, name, password, referralCode)
 *  2. Verify the referral code is active and has remaining uses
 *  3. Hash the password with Argon2id
 *  4. Insert the user and decrement the referral code counter in a DB transaction
 *
 * Responses:
 *  201 — User created successfully; returns the new user's public fields
 *  400 — Business rule violation (e.g. invalid referral code, duplicate username)
 *  422 — Request body failed schema validation (handled by global errorHandler)
 */

import { Elysia, t } from "elysia";
import { ResponseHandler, logger } from "@bse/utils";
import { UserModel } from "../../../../models/UserModel";

export const registerService = new Elysia().post(
  "/register",
  async ({ body, set }) => {
    try {
      logger.info({ username: body.username, email: body.email }, "Registration attempt");
      const user = await UserModel.registerUser(body);
      logger.info({ userId: user.id, username: user.username }, "User registered successfully");
      set.status = 201;
      return ResponseHandler.success(user, 201);
    } catch (error: any) {
      if (error.message === "Exhausted referral code.") {
        logger.warn(
          { username: body.username, referralCode: body.referralCode },
          "Registration failed: attempt to reuse exhausted referral code"
        );
      } else {
        logger.error({ username: body.username, error: error.message }, "Registration failed");
      }
      
      set.status = 400;
      return ResponseHandler.error(400, error.message);
    }
  },
  {
    body: t.Object({
      /** Unique login handle (min 3 characters) */
      username: t.String({ minLength: 3 }),
      /** Optional contact email */
      email: t.Optional(t.String({ format: "email" })),
      /** Display name */
      name: t.String(),
      /** Plain-text password — hashed server-side with Argon2id (min 6 characters) */
      password: t.String({ minLength: 6 }),
      /** Active referral code required to create an account */
      referralCode: t.String(),
    }),
  }
);
