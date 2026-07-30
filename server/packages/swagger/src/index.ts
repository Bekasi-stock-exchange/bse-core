import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

export const docs = new Elysia({ name: "@bse/swagger" }).use(
  process.env.ENABLE_DOCS === "true"
    ? swagger({
        documentation: {
          info: {
            title: "API Documentation",
            version: "1.0.0",
          },
        },
      })
    : (app) => app
);
