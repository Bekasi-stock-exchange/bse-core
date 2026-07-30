import { Elysia } from "elysia";
import { docs } from "@bse/swagger";
import { apiKeyMiddleware, errorHandler } from "@bse/utils";
import { v1Routes } from "./v1";

const app = new Elysia()
  .use(errorHandler)
  .use(docs)
  .use(apiKeyMiddleware)
  .use(v1Routes)
  .get("/", () => "Hello from ms-user");

export default app;
