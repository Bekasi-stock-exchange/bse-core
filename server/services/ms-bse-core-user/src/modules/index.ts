import { Elysia } from "elysia";
import { docs } from "@bse/swagger";
import { apiKeyMiddleware, errorHandler } from "@bse/utils";
import { v1Routes } from "./v1";

const app = new Elysia()
  .use(docs)
  .use(apiKeyMiddleware)
  .use(errorHandler)
  .use(v1Routes);

export default app;
