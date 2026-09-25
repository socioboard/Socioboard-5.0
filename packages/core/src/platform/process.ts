import type { Server } from 'node:http';

import { ConfigError, loadConfig, type Config } from './config';
import { createLogger, type Logger } from './logger';

/**
 * Loads config and the logger for an app entrypoint. Bad config prints every
 * problem and exits, so a misconfigured deploy fails fast and readably.
 */
export function bootstrap(name: string): { config: Config; logger: Logger } {
  let config: Config;
  try {
    config = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`[${name}] ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
  const logger = createLogger({
    level: config.logLevel,
    name,
    pretty: config.env === 'development' && process.stdout.isTTY,
  });
  // A crash is logged as one JSON line (with the stack) before exiting, instead of Node's raw
  // stderr dump. The state is unknown after an uncaught error, so no graceful shutdown: the
  // orchestrator restarts the process, and BullMQ retries any job it held.
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaught exception');
    process.exit(1);
  });
  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'unhandled promise rejection');
    process.exit(1);
  });
  return { config, logger };
}

/**
 * Stops an HTTP server: no new connections, idle keep-alive connections closed now, in-flight
 * requests allowed to finish for up to `graceMs`, then any connection still open is cut.
 */
export async function closeServer(server: Server, graceMs = 25_000): Promise<void> {
  const closed = new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  // A keep-alive connection whose request finishes would otherwise stay open (and accept more
  // requests) until its keep-alive timeout: ask clients to close, and close idle ones as they appear.
  const closeAfterResponse = (_req: unknown, res: { setHeader(n: string, v: string): void }) => {
    res.setHeader('Connection', 'close');
  };
  server.on('request', closeAfterResponse);
  server.closeIdleConnections();
  const sweep = setInterval(() => {
    server.closeIdleConnections();
  }, 100);
  const timer = setTimeout(() => {
    server.closeAllConnections();
  }, graceMs);
  try {
    await closed;
  } finally {
    clearInterval(sweep);
    clearTimeout(timer);
    server.off('request', closeAfterResponse);
  }
}

/** Runs `shutdown` once on SIGINT/SIGTERM; a second signal or a 35 s hang forces exit. */
export function onShutdown(logger: Logger, shutdown: () => Promise<void>): void {
  let stopping = false;
  const handle = (signal: string) => {
    if (stopping) {
      logger.warn({ signal }, 'forced exit');
      process.exit(1);
    }
    stopping = true;
    logger.info({ signal }, 'shutting down');
    setTimeout(() => {
      logger.error('shutdown took too long; exiting');
      process.exit(1);
    }, 35_000).unref();
    shutdown()
      .then(() => process.exit(0))
      .catch((err: unknown) => {
        logger.error({ err }, 'shutdown failed');
        process.exit(1);
      });
  };
  process.on('SIGINT', handle);
  process.on('SIGTERM', handle);
}
