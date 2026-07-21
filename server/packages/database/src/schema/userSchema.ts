import { pgSchema, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const userPgSchema = pgSchema("users");

export const users = userPgSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
