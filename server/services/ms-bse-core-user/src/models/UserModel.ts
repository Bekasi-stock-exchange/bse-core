import { db, users, userReferralCodes } from "@bse/database";
import { eq, and, gt } from "drizzle-orm";

export class UserModel {
  static async registerUser(data: any) {
    const { username, email, name, password, referralCode } = data;

    // 1. Verify referral code
    const [code] = await db
      .select()
      .from(userReferralCodes)
      .where(
        and(
          eq(userReferralCodes.code, referralCode),
          eq(userReferralCodes.isActive, true),
          gt(userReferralCodes.usesRemaining, 0)
        )
      )
      .limit(1);

    if (!code) {
      throw new Error("Invalid, inactive, or exhausted referral code.");
    }

    // 2. Hash password
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    // 3. Insert user and update referral code in a transaction
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
}
