import { pgSchema, uuid, decimal, timestamp } from "drizzle-orm/pg-core";
import { users } from "./userSchema";

export const transactionPgSchema = pgSchema("transactions");

export const transactions = transactionPgSchema.table("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
