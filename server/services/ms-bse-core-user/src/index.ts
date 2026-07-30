/**
 * @file src/index.ts
 * @description Service entry point for ms-bse-core-user.
 *
 * Bootstraps the Elysia application and starts the HTTP server on the
 * port defined by the PORT environment variable (default: 3000).
 */

import { logger } from "@bse/utils";
import app from "./modules";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(
    `🦊 ${process.env.APP_NAME || "App"} is running at http://${app.server?.hostname}:${app.server?.port}`,
  );
});
