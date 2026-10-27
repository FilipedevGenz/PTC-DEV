
type LogLevel = "debug" | "info" | "warn" | "error";
type Data = Record<string, any>;

const log = (level: LogLevel, message: string, data: Data = {},) => {
  console[level](JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }));
};

export const logger = {
  debug: (message: string, data?: Data) =>
    log("debug", message, data),
  info: (message: string, data?: Data) =>
    log("info", message, data),
  warn: (message: string, data?: Data) =>
    log("warn", message, data),
  error: (message: string, error?: any, data: Data = {}) =>
    log("error", message, {...data, error: error instanceof Error ? error.message : error,
    }),
};
