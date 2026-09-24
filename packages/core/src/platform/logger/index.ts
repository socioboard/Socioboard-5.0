import { AsyncLocalStorage } from 'node:async_hooks';

import { pino, type DestinationStream, type Logger, type LoggerOptions } from 'pino';

export type { Logger } from 'pino';

/** Correlation IDs attached to every log line written inside `runWithLogContext`. */
export interface LogContext {
  requestId?: string;
  jobId?: string;
  queue?: string;
  userId?: string;
  workspaceId?: string;
}

const contextStore = new AsyncLocalStorage<LogContext>();

export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
  return contextStore.run({ ...contextStore.getStore(), ...context }, fn);
}

/** Adds fields to the current context (e.g. userId once the session is known). */
export function addLogContext(context: LogContext): void {
  const store = contextStore.getStore();
  if (store) Object.assign(store, context);
}

/** Never log these, wherever they appear. */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.idToken',
  '*.secret',
  '*.clientSecret',
  '*.apiKey',
];

export interface CreateLoggerOptions {
  level: string;
  /** Human-readable output for local development. */
  pretty?: boolean;
  name?: string;
  /** Where lines go (tests); defaults to stdout. Ignored when `pretty` is on. */
  destination?: DestinationStream;
}

export function createLogger({
  level,
  pretty = false,
  name,
  destination,
}: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level,
    ...(name ? { name } : {}),
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    mixin: () => ({ ...contextStore.getStore() }),
    ...(pretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
          },
        }
      : {}),
  };
  return destination && !pretty ? pino(options, destination) : pino(options);
}
