type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, string | number | boolean | undefined>;

export type Logger = {
  [level in LogLevel]: (message: string, context?: LogContext) => void;
};

export const consoleLogger: Logger = {
  debug: (message, context) => console.debug(message, redactContext(context)),
  info: (message, context) => console.info(message, redactContext(context)),
  warn: (message, context) => console.warn(message, redactContext(context)),
  error: (message, context) => console.error(message, redactContext(context)),
};

export function redactContext(context: LogContext = {}): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret')
        ? '[REDACTED]'
        : value,
    ]),
  );
}
