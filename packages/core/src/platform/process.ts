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
  return { config, logger };
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
