import { z } from 'zod';

/** Dev-only key shipped in .env.example; rejected in production. */
export const EXAMPLE_ENCRYPTION_KEY = 'ZGV2LW9ubHkta2V5LW5vdC1mb3ItcHJvZHVjdGlvbiE=';

const optional = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .optional();

const bool = z
  .enum(['true', 'false', '1', '0', ''])
  .optional()
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  API_PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.url().default('http://localhost:5173'),

  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),

  SMTP_URL: optional,
  MAIL_FROM: z.string().default('Socioboard <no-reply@socioboard.local>'),

  S3_BUCKET: optional,
  S3_REGION: optional,
  S3_ACCESS_KEY_ID: optional,
  S3_SECRET_ACCESS_KEY: optional,
  S3_ENDPOINT: optional,
  S3_FORCE_PATH_STYLE: bool,

  /** Comma-separated `id:base64key` pairs, 32-byte keys; the first one encrypts. */
  ENCRYPTION_KEYS: z.string().min(1),

  STRIPE_SECRET_KEY: optional,
  AI_SERVICE_URL: optional,
});

export type Env = z.input<typeof envSchema>;

export interface EncryptionKey {
  id: string;
  key: Buffer;
}

export interface Config {
  env: 'development' | 'test' | 'production';
  isProduction: boolean;
  logLevel: string;
  api: { port: number };
  appUrl: string;
  db: { url: string; poolSize: number };
  redis: { url: string };
  mail: { smtpUrl: string | undefined; from: string };
  /** Undefined when no bucket is set; media features then report "storage not configured". */
  storage:
    | {
        bucket: string;
        region: string;
        endpoint: string | undefined;
        forcePathStyle: boolean;
        credentials: { accessKeyId: string; secretAccessKey: string } | undefined;
      }
    | undefined;
  encryption: { keys: EncryptionKey[] };
  /** Features switch on when their keys are present (self-host without Stripe = no billing). */
  billing: { enabled: boolean };
  ai: { enabled: boolean; url: string | undefined };
}

export class ConfigError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
    this.name = 'ConfigError';
  }
}

function parseEncryptionKeys(raw: string, problems: string[]): EncryptionKey[] {
  const keys: EncryptionKey[] = [];
  for (const entry of raw.split(',')) {
    const [id, b64] = entry.trim().split(':');
    const key = b64 ? Buffer.from(b64, 'base64') : Buffer.alloc(0);
    if (!id || key.length !== 32) {
      problems.push(`ENCRYPTION_KEYS: "${id ?? '?'}" must be id:base64 with a 32-byte key`);
      continue;
    }
    keys.push({ id, key });
  }
  return keys;
}

/** Validates the environment once at startup; throws ConfigError listing every problem. */
export function loadConfig(source: Record<string, string | undefined> = process.env): Config {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new ConfigError(
      parsed.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`),
    );
  }
  const e = parsed.data;
  const problems: string[] = [];

  const keys = parseEncryptionKeys(e.ENCRYPTION_KEYS, problems);
  if (e.NODE_ENV === 'production' && e.ENCRYPTION_KEYS.includes(EXAMPLE_ENCRYPTION_KEY)) {
    problems.push('ENCRYPTION_KEYS: the example dev key must not be used in production');
  }

  let storage: Config['storage'];
  if (e.S3_BUCKET) {
    if (!e.S3_REGION) problems.push('S3_REGION: required when S3_BUCKET is set');
    if (Boolean(e.S3_ACCESS_KEY_ID) !== Boolean(e.S3_SECRET_ACCESS_KEY)) {
      problems.push('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set together');
    }
    storage = {
      bucket: e.S3_BUCKET,
      region: e.S3_REGION ?? '',
      endpoint: e.S3_ENDPOINT,
      forcePathStyle: e.S3_FORCE_PATH_STYLE,
      // Without keys the AWS SDK falls back to its default chain (IAM role, profile).
      credentials:
        e.S3_ACCESS_KEY_ID && e.S3_SECRET_ACCESS_KEY
          ? { accessKeyId: e.S3_ACCESS_KEY_ID, secretAccessKey: e.S3_SECRET_ACCESS_KEY }
          : undefined,
    };
  }

  if (problems.length > 0) throw new ConfigError(problems);

  return {
    env: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    logLevel: e.LOG_LEVEL ?? (e.NODE_ENV === 'development' ? 'debug' : 'info'),
    api: { port: e.API_PORT },
    appUrl: e.APP_URL,
    db: { url: e.DATABASE_URL, poolSize: e.DATABASE_POOL_SIZE },
    redis: { url: e.REDIS_URL },
    mail: { smtpUrl: e.SMTP_URL, from: e.MAIL_FROM },
    storage,
    encryption: { keys },
    billing: { enabled: Boolean(e.STRIPE_SECRET_KEY) },
    ai: { enabled: Boolean(e.AI_SERVICE_URL), url: e.AI_SERVICE_URL },
  };
}
