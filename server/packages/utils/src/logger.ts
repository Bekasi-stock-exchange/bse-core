import pino from "pino";
import path from "path";

const appName = process.env.APP_NAME || "UNKNOWN_APP";

export const logger = pino(
  {
    name: appName,
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.transport({
    targets: [
      {
        target: "pino/file",
        options: { destination: 1 }, // stdout
      },
      {
        target: "pino-roll",
        options: {
          file: path.join(process.cwd(), "logs", appName),
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          extension: ".log",
          mkdir: true,
        },
      },
    ],
  })
);
