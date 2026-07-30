export interface StandardResponse<T = any> {
  statusCode: number;
  statusMessage: string;
  success: boolean;
  error?: string;
  errors?: { field: string; message: string }[];
  data?: T;
}

const statusMap: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

export class ResponseHandler {
  static success<T>(
    data?: T,
    statusCode: number = 200,
    statusMessage?: string
  ): StandardResponse<T> {
    return {
      statusCode,
      statusMessage: statusMessage || statusMap[statusCode] || "Success",
      success: true,
      ...(data !== undefined && { data }),
    };
  }

  static error(
    statusCode: number = 500,
    error?: string,
    errors?: { field: string; message: string }[],
    statusMessage?: string
  ): StandardResponse {
    return {
      statusCode,
      statusMessage: statusMessage || statusMap[statusCode] || "Error",
      success: false,
      ...(error && { error }),
      ...(errors && { errors }),
    };
  }
}
