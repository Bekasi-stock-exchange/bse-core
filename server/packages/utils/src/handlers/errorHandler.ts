import { Elysia, ValidationError } from "elysia";
import { ResponseHandler } from "./responseHandler";

export const errorHandler = new Elysia().onError(({ code, error, set }) => {
  if (code === "VALIDATION") {
    set.status = 400;

    const validationErrors = (error as any).all ?? (error as any).errors ?? [];
    const typeStr = typeof (error as any).type === 'string' ? (error as any).type : undefined;
    const onStr = typeof (error as any).on === 'string' ? (error as any).on : undefined;
    
    // Elysia exposes the context (body, query, params) either in 'type' or 'on' depending on the version
    let context = onStr || typeStr || "body";
    if (context === "validation") context = "body"; // if type was just "validation", default to body

    const errors = Array.from(validationErrors).map((err: any) => {
      let field = err.path?.replace(/^\//, "") || err.path;
      if (!field) field = context; // fallback to context if path is empty (e.g. root body)
      
      return {
        field,
        message: err.message || err.summary || "Invalid field",
      };
    });

    return ResponseHandler.error(400, "Validation failed", errors);
  }

  if (code === "NOT_FOUND") {
    set.status = 404;
    return ResponseHandler.error(404, "Route not found");
  }

  // Default error handler for 500
  set.status = 500;
  return ResponseHandler.error(500, (error as Error).message || "Internal server error");
}).as("global");
