import { Client } from "pg";

import * as readline from "readline/promises";

async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const targetDbName = url.pathname.slice(1);

  if (!targetDbName) {
    console.error("Could not parse database name from DATABASE_URL");
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", () => {
    console.log("\n[\x1b[36mi\x1b[0m] Reset cancelled via interrupt.");
    process.exit(1);
  });

  console.log("");
  console.log("\x1b[33m[!] WARNING: You are about to completely wipe the database!\x1b[0m");
  const answerY = await rl.question(`[\x1b[36m?\x1b[0m] Are you sure you want to reset "${targetDbName}"? (y/N): `);
  
  if (answerY.toLowerCase() !== "y") {
    console.log("[\x1b[36mi\x1b[0m] Reset cancelled.");
    rl.close();
    process.exit(1);
  }

  const answerConfirm = await rl.question(`[\x1b[36m?\x1b[0m] Please type CONFIRM to proceed with wiping "${targetDbName}": `);

  if (answerConfirm !== "CONFIRM") {
    console.log("[\x1b[36mi\x1b[0m] Reset cancelled. You must type CONFIRM exactly.");
    rl.close();
    process.exit(1);
  }

  rl.close();

  // Connect to the default 'postgres' db
  url.pathname = "/postgres";

  const client = new Client({
    connectionString: url.toString(),
  });

  try {
    await client.connect();
    
    // Drop the database, forcing disconnection of other clients
    await client.query(`DROP DATABASE IF EXISTS "${targetDbName}" WITH (FORCE);`);
    console.log(`[\x1b[32m✓\x1b[0m] Database "${targetDbName}" dropped`);
    
    // Recreate it fresh
    await client.query(`CREATE DATABASE "${targetDbName}"`);
    console.log(`[\x1b[32m✓\x1b[0m] Database "${targetDbName}" recreated successfully`);
    
  } catch (err: any) {
    console.error(`[\x1b[31m!\x1b[0m] Error resetting database: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
