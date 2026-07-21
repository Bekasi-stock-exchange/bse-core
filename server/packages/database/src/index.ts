import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as userSchema from "./schema/userSchema";
import * as transactionSchema from "./schema/transactionSchema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
});

export const schema = {
  ...userSchema,
  ...transactionSchema,
};

export const db = drizzle(pool, { schema });

// Export everything from schemas so other packages can use the tables/types
export * from "./schema/userSchema";
export * from "./schema/transactionSchema";
