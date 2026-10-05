import { AsyncLocalStorage } from 'node:async_hooks';

import {
  pino,
  stdSerializers,
  type DestinationStream,
  type Logger,
  type LoggerOptions,
} from 'pino';

import { exportLogLine, traceFields } from '../telemetry/logs';

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

/**
 * Keys whose values are never logged, at any depth (compared lowercased, without `-`/`_`).
 * Covers auth headers, OAuth tokens, passwords and API secrets, including inside error objects
 * returned by network APIs.
 */
const SECRET_KEYS = new Set([
  'authorization',
  'proxyauthorization',
  'cookie',
  'setcookie',
  'password',
  'passwd',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'oauthtoken',
  'oauthtokensecret',
  'secret',
  'clientsecret',
  'apikey',
  'xapikey',
  'privatekey',
  'encryptionkeys',
]);

const REDACTED = '[redacted]';
const MAX_DEPTH = 8;

const isSecretKey = (key: string) => SECRET_KEYS.has(key.toLowerCase().replace(/[-_]/g, ''));

/** Returns a copy of `value` with secret-named fields replaced. Exported for tests. */
export function redactSecrets(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return '[truncated]';
  if (Array.isArray(value)) return value.map((v) => redactSecrets(v, depth + 1));
  if (value instanceof Date || Buffer.isBuffer(value)) return value;
  // Keep message, stack and cause, and still redact any fields the error carries.
  if (value instanceof Error) return redactSecrets({ ...stdSerializers.err(value) }, depth);
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = isSecretKey(key) ? REDACTED : redactSecrets(v, depth + 1);
  }
  return out;
}

export interface CreateLoggerOptions {
  level: string;
  /** Human-readable output for local development. */
  pretty?: boolean;
  name?: string;
  /** Where lines go (tests); defaults to stdout. Ignored when `pretty` is on. */
  destination?: DestinationStream;
  /** Also send each line to OpenTelemetry (telemetry on: docs/infra.md#observability). */
  exportLogs?: boolean;
}

export function createLogger({
  level,
  pretty = false,
  name,
  destination,
  exportLogs = false,
}: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level,
    ...(name ? { name } : {}),
    // Pino calls this on every log object before writing it. It also serializes errors (at any
    // key), so Pino's own err serializer is a pass-through to avoid serializing them twice.
    formatters: { log: (obj) => redactSecrets(obj) as Record<string, unknown> },
    serializers: { err: (value: unknown) => value },
    mixin: () => ({ ...contextStore.getStore(), ...traceFields() }),
    // The finished line, after redaction, goes to OpenTelemetry as it is written (same call, so
    // the record joins the current trace).
    ...(exportLogs
      ? {
          hooks: {
            streamWrite: (line: string) => {
              exportLogLine(line);
              return line;
            },
          },
        }
      : {}),
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
