import winston from "winston";
const { combine, timestamp, label, printf, errors, colorize } = winston.format;
const lineFormat = printf(({ level, message, label, timestamp: ts, scope }) => {
  const tag = scope ? ` [${scope as string}]` : "";
  return `${timestamp} [${label}]${tag} ${level}: ${message as string} ${ts as string}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    lineFormat,
  ),

  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ level: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        lineFormat,
      ),
    }),
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "error",
    }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
export function createLogger(scope: string): winston.Logger {
  return logger.child({ scope });
}

export type Logger = winston.Logger;

export default logger;
