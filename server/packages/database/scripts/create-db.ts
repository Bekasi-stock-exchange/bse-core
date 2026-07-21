import { Client } from "pg";

async function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  // Parse the connection string to extract the target database name
  const url = new URL(databaseUrl);
  const targetDbName = url.pathname.slice(1);

  if (!targetDbName) {
    console.error("Could not parse database name from DATABASE_URL");
    process.exit(1);
  }

  // Change the connection URL to connect to the default 'postgres' database
  // because we can't connect to a database that doesn't exist yet to create it
  url.pathname = "/postgres";

  const client = new Client({
    connectionString: url.toString(),
  });

  try {
    await client.connect();
    
    await client.query(`CREATE DATABASE "${targetDbName}"`);
    console.log(`[\x1b[32m✓\x1b[0m] Database "${targetDbName}" created successfully`);
  } catch (err: any) {
    // 42P04 is the PostgreSQL error code for "duplicate database"
    if (err.code === "42P04") {
      console.log(`[\x1b[36mi\x1b[0m] Database "${targetDbName}" already exists`);
    } else {
      console.error(`[\x1b[31m!\x1b[0m] Error creating database: ${err.message}`);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
