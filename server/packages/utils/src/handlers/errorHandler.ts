import { Elysia } from "elysia";
import { ResponseHandler } from "./responseHandler";

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    // 422 Unprocessable Entity - schema/body/query/params validation failed
    if (code === "VALIDATION") {
      set.status = 422;

      const validationErrors =
        (error as any).all ?? (error as any).errors ?? [];
      const typeStr =
        typeof (error as any).type === "string"
          ? (error as any).type
          : undefined;
      const onStr =
        typeof (error as any).on === "string" ? (error as any).on : undefined;

      // Elysia exposes the context (body, query, params) either in 'type' or 'on' depending on the version
      let context = onStr || typeStr || "body";
      if (context === "validation") context = "body";

      const errors = Array.from(validationErrors).map((err: any) => {
        let field = err.path?.replace(/^\//, "") || err.path;
        if (!field) field = context;

        return {
          field,
          message: err.message || err.summary || "Invalid field",
        };
      });

      return ResponseHandler.error(422, "Validation failed", errors);
    }

    // 400 Bad Request - body could not be parsed (e.g. malformed JSON)
    if (code === "PARSE") {
      set.status = 400;
      return ResponseHandler.error(
        400,
        "Failed to parse request body. Ensure the body is valid JSON and the Content-Type header is set correctly."
      );
    }

    // 404 Not Found - no route matched the incoming request
    if (code === "NOT_FOUND") {
      set.status = 404;
      return ResponseHandler.error(404, "The requested route was not found.");
    }

    // 500 Internal Server Error - unknown / unhandled runtime error
    set.status = 500;
    return ResponseHandler.error(
      500,
      (error as Error).message || "An unexpected internal server error occurred."
    );
  })
  .as("global");
