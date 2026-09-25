import { isIP } from 'node:net';

import { z } from 'zod';

/** Dev-only values shipped in .env.example; rejected in production. */
export const EXAMPLE_ENCRYPTION_KEY = 'ZGV2LW9ubHkta2V5LW5vdC1mb3ItcHJvZHVjdGlvbiE=';
export const EXAMPLE_AUTH_SECRET = 'dev-only-auth-secret-do-not-use-in-production';

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
  /**
   * Proxies whose X-Forwarded-For we believe: comma-separated IPs or CIDR ranges, or "loopback"
   * (dev: the Vite proxy). The client IP is the nearest address not in this list; it drives every
   * rate limit, so production must list its real proxies (a load balancer's range, Caddy's IP).
   */
  TRUST_PROXY: z
    .string()
    .default('loopback')
    .transform((raw, ctx) => {
      const entries = raw
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      for (const entry of entries) {
        const [ip = '', prefix] = entry.split('/');
        const version = isIP(ip);
        const prefixOk =
          prefix === undefined ||
          (/^\d+$/.test(prefix) && Number(prefix) <= (version === 6 ? 128 : 32));
        if (entry !== 'loopback' && (version === 0 || !prefixOk)) {
          ctx.addIssue({
            code: 'custom',
            message: `"${entry}" is not "loopback", an IP or a CIDR range`,
          });
        }
      }
      return entries;
    }),
  /** Requests per minute per client IP on /api/v1. */
  API_RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(300),

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
  ENCRYPTION_KEYS: z
    .string()
    .min(1)
    .transform((raw, ctx) => {
      const keys: EncryptionKey[] = [];
      for (const entry of raw.split(',')) {
        const [id, b64] = entry.trim().split(':');
        const key = b64 ? Buffer.from(b64, 'base64') : Buffer.alloc(0);
        if (!id || key.length !== 32) {
          ctx.addIssue({
            code: 'custom',
            message: `"${id ?? '?'}" must be id:base64 with a 32-byte key`,
          });
        } else {
          keys.push({ id, key });
        }
      }
      return keys;
    }),

  /** Signs sessions and auth tokens; at least 32 characters. */
  AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  /** Check new passwords against the Have I Been Pwned range API (off for offline installs). */
  AUTH_BREACHED_PASSWORD_CHECK: z
    .enum(['true', 'false', '1', '0', ''])
    .optional()
    .transform((v) => v === undefined || v === '' || v === 'true' || v === '1'),
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,
  MICROSOFT_CLIENT_ID: optional,
  MICROSOFT_CLIENT_SECRET: optional,
  /** "common" (any Microsoft account) unless limited to one tenant. */
  MICROSOFT_TENANT_ID: z.string().default('common'),

  /** ffmpeg/ffprobe for video duration and thumbnails; without them videos get neither. */
  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),

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
  api: { port: number; trustedProxies: string[]; rateLimitPerMin: number };
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
  media: { ffmpegPath: string; ffprobePath: string };
  auth: {
    secret: string;
    breachedPasswordCheck: boolean;
    /** Social sign-in providers register only when both id and secret are set. */
    google: { clientId: string; clientSecret: string } | undefined;
    microsoft: { clientId: string; clientSecret: string; tenantId: string } | undefined;
  };
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

/** Validates the environment once at startup; throws ConfigError listing every problem. */
export function loadConfig(source: Record<string, string | undefined> = process.env): Config {
  // Rules that span several variables read the raw values, so they are reported together
  // with per-field problems instead of only after those are fixed.
  const raw = (name: string) => {
    const value = source[name]?.trim();
    return value === '' ? undefined : value;
  };
  const problems: string[] = [];
  if (raw('S3_BUCKET')) {
    if (!raw('S3_REGION')) problems.push('S3_REGION: required when S3_BUCKET is set');
    if (Boolean(raw('S3_ACCESS_KEY_ID')) !== Boolean(raw('S3_SECRET_ACCESS_KEY'))) {
      problems.push('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set together');
    }
  }
  if (
    raw('NODE_ENV') === 'production' &&
    raw('ENCRYPTION_KEYS')?.includes(EXAMPLE_ENCRYPTION_KEY)
  ) {
    problems.push('ENCRYPTION_KEYS: the example dev key must not be used in production');
  }
  if (raw('NODE_ENV') === 'production' && raw('AUTH_SECRET') === EXAMPLE_AUTH_SECRET) {
    problems.push('AUTH_SECRET: the example dev secret must not be used in production');
  }
  if (raw('NODE_ENV') === 'production' && !raw('TRUST_PROXY')) {
    problems.push(
      'TRUST_PROXY: required in production (the IPs or CIDR ranges of your proxies), otherwise every client shares one rate limit',
    );
  }
  for (const provider of ['GOOGLE', 'MICROSOFT']) {
    if (Boolean(raw(`${provider}_CLIENT_ID`)) !== Boolean(raw(`${provider}_CLIENT_SECRET`))) {
      problems.push(`${provider}_CLIENT_ID and ${provider}_CLIENT_SECRET must be set together`);
    }
  }

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    problems.unshift(
      ...parsed.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`),
    );
  }
  if (!parsed.success || problems.length > 0) throw new ConfigError(problems);
  const e = parsed.data;

  let storage: Config['storage'];
  if (e.S3_BUCKET) {
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

  return {
    env: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    logLevel: e.LOG_LEVEL ?? (e.NODE_ENV === 'development' ? 'debug' : 'info'),
    api: {
      port: e.API_PORT,
      trustedProxies: e.TRUST_PROXY,
      rateLimitPerMin: e.API_RATE_LIMIT_PER_MIN,
    },
    appUrl: e.APP_URL,
    db: { url: e.DATABASE_URL, poolSize: e.DATABASE_POOL_SIZE },
    redis: { url: e.REDIS_URL },
    mail: { smtpUrl: e.SMTP_URL, from: e.MAIL_FROM },
    storage,
    encryption: { keys: e.ENCRYPTION_KEYS },
    media: { ffmpegPath: e.FFMPEG_PATH, ffprobePath: e.FFPROBE_PATH },
    auth: {
      secret: e.AUTH_SECRET,
      breachedPasswordCheck: e.AUTH_BREACHED_PASSWORD_CHECK,
      google:
        e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET
          ? { clientId: e.GOOGLE_CLIENT_ID, clientSecret: e.GOOGLE_CLIENT_SECRET }
          : undefined,
      microsoft:
        e.MICROSOFT_CLIENT_ID && e.MICROSOFT_CLIENT_SECRET
          ? {
              clientId: e.MICROSOFT_CLIENT_ID,
              clientSecret: e.MICROSOFT_CLIENT_SECRET,
              tenantId: e.MICROSOFT_TENANT_ID,
            }
          : undefined,
    },
    billing: { enabled: Boolean(e.STRIPE_SECRET_KEY) },
    ai: { enabled: Boolean(e.AI_SERVICE_URL), url: e.AI_SERVICE_URL },
  };
}
