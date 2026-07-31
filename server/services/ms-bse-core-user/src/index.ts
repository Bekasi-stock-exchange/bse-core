/**
 * @file src/index.ts
 * @description Service entry point for ms-bse-core-user.
 *
 * Bootstraps the Elysia application and starts the HTTP server on the
 * port defined by the PORT environment variable (default: 3000).
 *
 * Startup guard: verifies database connectivity before binding the port.
 * If the database is unreachable, the process exits without listening so
 * dependent clients fail fast rather than hitting runtime query errors.
 */

import { logger } from "@bse/utils";
import { checkDatabase } from "@bse/database";
import app from "./modules";
export type { App } from "./modules";

const PORT = process.env.PORT || 3000;

const start = async () => {
  const dbReady = await checkDatabase();
  if (!dbReady) {
    logger.error("Database is not reachable. Aborting startup.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(
      `🦊 ${process.env.APP_NAME || "App"} is running at http://${app.server?.hostname}:${app.server?.port}`,
    );
  });
};

start();
