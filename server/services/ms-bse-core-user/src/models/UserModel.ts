/**
 * @file src/models/UserModel.ts
 * @description Data-access layer for user-related database operations.
 *
 * All DB queries live here so the service layer stays free of raw SQL/ORM calls.
 * Methods are grouped by feature area: Registration, Lookup, and Token management.
 */

import { db, users, userReferralCodes, userTokens } from "@bse/database";
import { eq, and, gt } from "drizzle-orm";

export class UserModel {
  // ──────────────────────────────────────────────
  // Registration
  // ──────────────────────────────────────────────

  /**
   * Register a new user.
   *
   * Steps (run in a single DB transaction):
   *  1. Verify the referral code is active and has remaining uses
   *  2. Hash the password with Argon2id via `Bun.password.hash`
   *  3. Insert the user row
   *  4. Decrement `usesRemaining` on the referral code
   *
   * @throws {Error} If the referral code is invalid, inactive, or exhausted
   * @returns Public user fields: { id, username, email, name }
   */
  static async registerUser(data: any) {
    const { username, email, name, password, referralCode } = data;

    // 1. Verify referral code is active and has remaining uses
    const [code] = await db
      .select()
      .from(userReferralCodes)
      .where(eq(userReferralCodes.code, referralCode))
      .limit(1);

    if (!code) {
      throw new Error("Invalid referral code.");
    }

    if (!code.isActive) {
      throw new Error("Inactive referral code.");
    }

    if (code.usesRemaining <= 0) {
      throw new Error("Exhausted referral code.");
    }

    // 2. Hash password (Argon2id via Bun's built-in)
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    // 3 & 4. Insert user and decrement referral code in one atomic transaction
    const newUser = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          username,
          email,
          name,
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
        });

      await tx
        .update(userReferralCodes)
        .set({
          usesRemaining: code.usesRemaining - 1,
        })
        .where(eq(userReferralCodes.id, code.id));

      return insertedUser;
    });

    return newUser;
  }

  // ──────────────────────────────────────────────
  // User Lookup
  // ──────────────────────────────────────────────

  /**
   * Find a user by their unique username.
   * @returns The full user row, or `null` if not found
   */
  static async findByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user ?? null;
  }

  /**
   * Find a user by their email address.
   * @returns The full user row, or `null` if not found
   */
  static async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  }

  /**
   * Find a user by their primary key (UUID).
   * Used during token refresh to confirm the account is still active.
   * @returns The full user row, or `null` if not found
   */
  static async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }

  // ──────────────────────────────────────────────
  // Refresh Token Management
  // ──────────────────────────────────────────────

  /**
   * Persist a hashed refresh token for a user.
   *
   * The `token` value stored here is always the SHA-256 hash of the raw token
   * that was sent to the client — never the raw value itself.
   *
   * @param userId        UUID of the owning user
   * @param hashedToken   SHA-256 hex digest of the raw refresh token
   * @param expiresAt     Absolute expiry timestamp (7 days from issuance)
   */
  static async storeRefreshToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date
  ) {
    await db.insert(userTokens).values({
      idUser: userId,
      token: hashedToken,
      type: "refresh",
      expiresAt,
    });
  }

  /**
   * Look up a refresh token row by its hashed value.
   *
   * To use: hash the raw incoming token with `hashToken()` then call this.
   *
   * @param hashedToken   SHA-256 hex digest of the raw refresh token
   * @returns The token row (includes `idUser` and `expiresAt`), or `null`
   */
  static async findRefreshToken(hashedToken: string) {
    const [row] = await db
      .select()
      .from(userTokens)
      .where(
        and(
          eq(userTokens.token, hashedToken),
          eq(userTokens.type, "refresh")
        )
      )
      .limit(1);
    return row ?? null;
  }

  /**
   * Delete a refresh token row (used on logout and token rotation).
   *
   * @param hashedToken   SHA-256 hex digest of the raw refresh token to revoke
   */
  static async deleteRefreshToken(hashedToken: string) {
    await db
      .update(userTokens)
      .set({ isActive: false })
      .where(
        and(
          eq(userTokens.token, hashedToken),
          eq(userTokens.type, "refresh")
        )
      );
  }

  /**
   * Revoke all tokens for a specific user (used when token reuse is detected).
   */
  static async revokeAllUserTokens(idUser: string) {
    await db
      .update(userTokens)
      .set({ isActive: false })
      .where(eq(userTokens.idUser, idUser));
  }
}
