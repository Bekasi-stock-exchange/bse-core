import {
  pgSchema,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const userPgSchema = pgSchema("users");

export const users = userPgSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deactivatedAt: timestamp("deactivated_at"),
  idLevel: integer("id_level")
    .default(1)
    .notNull()
    .references(() => userLevels.id),
});

export const userLevels = userPgSchema.table("user_levels", {
  id: integer("id").primaryKey(),
  name: varchar("user_level_name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userTokens = userPgSchema.table("user_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  idUser: uuid("id_user")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userReferralCodes = userPgSchema.table("user_referral_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  usesRemaining: integer("uses_remaining").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
