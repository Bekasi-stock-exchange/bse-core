import { Elysia } from "elysia";

import { ResponseHandler } from "../handlers/responseHandler";

export const useApiKey = new Elysia({ name: "api-key-middleware" })
  .onBeforeHandle(({ request, set }) => {
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
      console.warn("API_KEY environment variable is not set.");
    }

    if (!apiKey || apiKey !== validApiKey) {
      set.status = 401;
      return ResponseHandler.error(401, "Unauthorized");
    }
  })
  .as("global");
