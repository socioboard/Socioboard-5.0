import { WORKSPACE_SCOPED_MODELS } from '@socioboard/db';

import { systemClock, type Clock } from './clock';
import type { Config } from './config';
import { createCrypto, type Crypto } from './crypto';
import { createDb, type Db } from './db';
import { createEventBus, type EventBus } from './events';
import { createKv, type Kv } from './kv';
import type { Logger } from './logger';
import { createMailer, type Mailer } from './mailer';
import { createQueues, type Queues } from './queue';
import { createStorage, type Storage } from './storage';

/** Every external client, created once per process and passed to module factories. */
export interface Platform {
  config: Config;
  logger: Logger;
  clock: Clock;
  crypto: Crypto;
  db: Db;
  queues: Queues;
  kv: Kv;
  /** App-wide event bus; each module declares its events and listeners subscribe by name. */
  events: EventBus<Record<string, unknown>>;
  /** Undefined until S3 (or MinIO) is configured. */
  storage: Storage | undefined;
  mailer: Mailer;
  /** Closes everything in reverse order of dependence; waits for active jobs up to 30 s. */
  close(): Promise<void>;
}

export interface PlatformOptions {
  /** Prefix for Valkey keys and queues; tests use their own so they don't touch dev data. */
  prefix?: string;
}

export function createPlatform(
  config: Config,
  logger: Logger,
  { prefix = 'sb' }: PlatformOptions = {},
): Platform {
  const db = createDb({
    url: config.db.url,
    poolSize: config.db.poolSize,
    scopedModels: WORKSPACE_SCOPED_MODELS,
  });
  const queues = createQueues({ url: config.redis.url, logger, prefix });
  const kv = createKv({ url: config.redis.url, prefix: `${prefix}:` });
  const storage = config.storage ? createStorage(config.storage) : undefined;
  const mailer = createMailer({ smtpUrl: config.mail.smtpUrl, from: config.mail.from, logger });

  if (!storage) logger.warn('S3_BUCKET not set: media uploads are disabled');

  return {
    config,
    logger,
    clock: systemClock,
    crypto: createCrypto(config.encryption.keys),
    db,
    queues,
    kv,
    events: createEventBus({ logger }),
    storage,
    mailer,
    async close() {
      await queues.close(30_000);
      kv.close();
      mailer.close();
      storage?.close();
      await db.close();
    },
  };
}
