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
  /**
   * Where media is kept: `s3` (Amazon S3 or any S3-compatible service; the default when
   * S3_BUCKET is set) or `nas` (a NAS behind a small upload/delete API with public reads:
   * docs/backend/modules/media.md, "NAS storage").
   */
  STORAGE_DRIVER: optional.pipe(z.enum(['s3', 'nas']).optional()),
  /** NAS upload and delete endpoint, including its bucket, e.g. http://host:8119/socioboard-dev */
  NAS_API_URL: optional.pipe(z.url({ protocol: /^https?$/ }).optional()),
  /** Where the NAS serves files (public, no expiry): <NAS_PUBLIC_URL><path it returned>. */
  NAS_PUBLIC_URL: optional.pipe(z.url({ protocol: /^https?$/ }).optional()),
  /** The NAS API's token, `<access key>:<secret>`. */
  NAS_API_TOKEN: optional,
  /** Browser uploads wait here (API host) until they're sent to the NAS; default: the OS temp dir. */
  STORAGE_TEMP_DIR: optional,

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

  /** Facebook Login for Business app: Facebook Pages and Instagram accounts linked to a Page. */
  META_APP_ID: optional,
  META_APP_SECRET: optional,
  /** Login for Business configuration id (permissions set on Meta's side); else scopes are sent. */
  META_LOGIN_CONFIG_ID: optional,
  /** Instagram Login (Instagram accounts without a Page): its own app id and secret. */
  INSTAGRAM_APP_ID: optional,
  INSTAGRAM_APP_SECRET: optional,
  /** Threads (the Threads use case on the same Meta app): its own app id and secret. */
  THREADS_APP_ID: optional,
  THREADS_APP_SECRET: optional,
  /** Graph API version, e.g. v25.0 (or 25.0); defaults to the one the adapters were checked against. */
  /** X: the app's OAuth 2.0 client; redirect URI <APP_URL>/api/oauth/x/callback. */
  X_CLIENT_ID: optional,
  X_CLIENT_SECRET: optional,
  /**
   * The phase 3 networks' OAuth clients (docs/developer-apps.md), each enabled when both are set;
   * redirect URI <APP_URL>/api/oauth/<provider>/callback. Read only once the network's adapter is
   * registered (docs/backend/adding-a-network.md).
   */
  LINKEDIN_CLIENT_ID: optional,
  LINKEDIN_CLIENT_SECRET: optional,
  /** YouTube's own Google Cloud OAuth client, not the sign-in one (GOOGLE_CLIENT_ID). */
  YOUTUBE_CLIENT_ID: optional,
  YOUTUBE_CLIENT_SECRET: optional,
  /** Pinterest's App ID and App secret key. */
  PINTEREST_CLIENT_ID: optional,
  PINTEREST_CLIENT_SECRET: optional,
  /** TikTok's Client key and Client secret. */
  TIKTOK_CLIENT_ID: optional,
  TIKTOK_CLIENT_SECRET: optional,
  SNAPCHAT_CLIENT_ID: optional,
  SNAPCHAT_CLIENT_SECRET: optional,
  /** Tumblr's OAuth consumer key and secret (used as an OAuth 2 client). */
  TUMBLR_CLIENT_ID: optional,
  TUMBLR_CLIENT_SECRET: optional,
  /** Bitly: the OAuth app people connect their own Bitly accounts through (P3-B8). */
  BITLY_CLIENT_ID: optional,
  BITLY_CLIENT_SECRET: optional,
  META_GRAPH_VERSION: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .trim()
      .regex(/^v?\d+\.\d+$/, 'must look like v25.0')
      .transform((v) => (v.startsWith('v') ? v : `v${v}`))
      .optional(),
  ),

  /**
   * Public address networks fetch media from when they can't take an upload (Instagram images):
   * media.<domain> in production, the dev tunnel's /public-media locally. Unset: those can't post.
   */
  MEDIA_PUBLIC_URL: optional.pipe(z.url({ protocol: /^https?$/ }).optional()),
  /**
   * Only when the bucket is publicly readable (a CDN in front of it): networks fetch
   * <STORAGE_PUBLIC_URL>/<key> directly. Handy in development; MEDIA_PUBLIC_URL wins when both
   * are set, and production should keep storage private.
   */
  STORAGE_PUBLIC_URL: optional.pipe(z.url({ protocol: /^https?$/ }).optional()),

  /** ffmpeg/ffprobe for video duration and thumbnails; without them videos get neither. */
  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),

  /** How long audit entries are kept (2 years on the hosted cloud). */
  AUDIT_RETENTION_DAYS: z.coerce.number().int().positive().default(730),

  /**
   * OpenTelemetry collector (docs/infra.md#observability), e.g. http://127.0.0.1:5080/api/default
   * for self-hosted OpenObserve: traces, metrics and logs go to <url>/v1/traces, /v1/metrics and
   * /v1/logs.
   * Unset: nothing is exported. OTEL_EXPORTER_OTLP_HEADERS and OTEL_RESOURCE_ATTRIBUTES apply.
   */
  OTEL_EXPORTER_OTLP_ENDPOINT: optional.pipe(z.url({ protocol: /^https?$/ }).optional()),
  /** Built-in alerts (docs/backend/modules/admin.md#alerts-p2-i1), emailed to platform admins. */
  ALERT_FAILED_PUBLISHES: z.coerce.number().int().positive().default(10),
  ALERT_QUEUE_WAITING: z.coerce.number().int().positive().default(1000),
  ALERT_QUEUE_LAG_MINUTES: z.coerce.number().int().positive().default(10),

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
  /** Undefined when no storage is set; media features then report "storage not configured". */
  storage:
    | {
        driver: 's3';
        bucket: string;
        region: string;
        endpoint: string | undefined;
        forcePathStyle: boolean;
        credentials: { accessKeyId: string; secretAccessKey: string } | undefined;
      }
    | {
        driver: 'nas';
        apiUrl: string;
        publicUrl: string;
        token: string;
        tempDir: string | undefined;
      }
    | undefined;
  encryption: { keys: EncryptionKey[] };
  media: {
    ffmpegPath: string;
    ffprobePath: string;
    publicUrl: string | undefined;
    storagePublicUrl: string | undefined;
  };
  audit: { retentionDays: number };
  /** OpenTelemetry export; off without an endpoint. */
  telemetry: { endpoint: string | undefined; enabled: boolean };
  /** Built-in alerts: failed deliveries in 15 minutes, jobs waiting, minutes a queue may stall. */
  alerts: { failedPublishes: number; queueWaiting: number; queueLagMinutes: number };
  auth: {
    secret: string;
    breachedPasswordCheck: boolean;
    /** Social sign-in providers register only when both id and secret are set. */
    google: { clientId: string; clientSecret: string } | undefined;
    microsoft: { clientId: string; clientSecret: string; tenantId: string } | undefined;
  };
  /** Social networks: each login registers only when its id and secret are set. */
  networks: {
    facebook: { appId: string; appSecret: string; configId: string | undefined } | undefined;
    instagram: { appId: string; appSecret: string } | undefined;
    threads: { appId: string; appSecret: string } | undefined;
    x: OAuthClient | undefined;
    linkedin: OAuthClient | undefined;
    youtube: OAuthClient | undefined;
    pinterest: OAuthClient | undefined;
    tiktok: OAuthClient | undefined;
    snapchat: OAuthClient | undefined;
    tumblr: OAuthClient | undefined;
    graphVersion: string | undefined;
  };
  /** Link shorteners people connect (P3-B8); each registers only when its id and secret are set. */
  shorteners: { bitly: OAuthClient | undefined };
  /** Features switch on when their keys are present (self-host without Stripe = no billing). */
  billing: { enabled: boolean };
  ai: { enabled: boolean; url: string | undefined };
}

/** An OAuth app's client id and secret. */
export interface OAuthClient {
  clientId: string;
  clientSecret: string;
}

/** Env prefixes of the OAuth clients that are set as `<PREFIX>_CLIENT_ID` / `_CLIENT_SECRET`. */
const OAUTH_CLIENTS = [
  'X',
  'LINKEDIN',
  'YOUTUBE',
  'PINTEREST',
  'TIKTOK',
  'SNAPCHAT',
  'TUMBLR',
  'BITLY',
] as const;

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
  const nas = raw('STORAGE_DRIVER') === 'nas';
  if (nas) {
    for (const name of ['NAS_API_URL', 'NAS_PUBLIC_URL', 'NAS_API_TOKEN']) {
      if (!raw(name)) problems.push(`${name}: required when STORAGE_DRIVER=nas`);
    }
  } else if (raw('STORAGE_DRIVER') === 's3' && !raw('S3_BUCKET')) {
    problems.push('S3_BUCKET: required when STORAGE_DRIVER=s3');
  }
  if (!nas && raw('S3_BUCKET')) {
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
  for (const app of ['META', 'INSTAGRAM', 'THREADS']) {
    if (Boolean(raw(`${app}_APP_ID`)) !== Boolean(raw(`${app}_APP_SECRET`))) {
      problems.push(`${app}_APP_ID and ${app}_APP_SECRET must be set together`);
    }
  }
  for (const client of OAUTH_CLIENTS) {
    if (Boolean(raw(`${client}_CLIENT_ID`)) !== Boolean(raw(`${client}_CLIENT_SECRET`))) {
      problems.push(`${client}_CLIENT_ID and ${client}_CLIENT_SECRET must be set together`);
    }
  }
  if (Boolean(raw('YOUTUBE_CLIENT_ID')) !== Boolean(raw('YOUTUBE_CLIENT_SECRET'))) {
    problems.push('YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET must be set together');
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
  if (e.STORAGE_DRIVER === 'nas') {
    storage = {
      driver: 'nas',
      apiUrl: (e.NAS_API_URL ?? '').replace(/\/+$/, ''),
      publicUrl: (e.NAS_PUBLIC_URL ?? '').replace(/\/+$/, ''),
      token: e.NAS_API_TOKEN ?? '',
      tempDir: e.STORAGE_TEMP_DIR,
    };
  } else if (e.S3_BUCKET) {
    storage = {
      driver: 's3',
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
    media: {
      ffmpegPath: e.FFMPEG_PATH,
      ffprobePath: e.FFPROBE_PATH,
      publicUrl: e.MEDIA_PUBLIC_URL,
      storagePublicUrl: e.STORAGE_PUBLIC_URL,
    },
    audit: { retentionDays: e.AUDIT_RETENTION_DAYS },
    telemetry: {
      endpoint: e.OTEL_EXPORTER_OTLP_ENDPOINT,
      enabled: Boolean(e.OTEL_EXPORTER_OTLP_ENDPOINT),
    },
    alerts: {
      failedPublishes: e.ALERT_FAILED_PUBLISHES,
      queueWaiting: e.ALERT_QUEUE_WAITING,
      queueLagMinutes: e.ALERT_QUEUE_LAG_MINUTES,
    },
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
    networks: {
      facebook:
        e.META_APP_ID && e.META_APP_SECRET
          ? { appId: e.META_APP_ID, appSecret: e.META_APP_SECRET, configId: e.META_LOGIN_CONFIG_ID }
          : undefined,
      instagram:
        e.INSTAGRAM_APP_ID && e.INSTAGRAM_APP_SECRET
          ? { appId: e.INSTAGRAM_APP_ID, appSecret: e.INSTAGRAM_APP_SECRET }
          : undefined,
      threads:
        e.THREADS_APP_ID && e.THREADS_APP_SECRET
          ? { appId: e.THREADS_APP_ID, appSecret: e.THREADS_APP_SECRET }
          : undefined,
      x: oauthClient(e.X_CLIENT_ID, e.X_CLIENT_SECRET),
      linkedin: oauthClient(e.LINKEDIN_CLIENT_ID, e.LINKEDIN_CLIENT_SECRET),
      youtube: oauthClient(e.YOUTUBE_CLIENT_ID, e.YOUTUBE_CLIENT_SECRET),
      pinterest: oauthClient(e.PINTEREST_CLIENT_ID, e.PINTEREST_CLIENT_SECRET),
      tiktok: oauthClient(e.TIKTOK_CLIENT_ID, e.TIKTOK_CLIENT_SECRET),
      snapchat: oauthClient(e.SNAPCHAT_CLIENT_ID, e.SNAPCHAT_CLIENT_SECRET),
      tumblr: oauthClient(e.TUMBLR_CLIENT_ID, e.TUMBLR_CLIENT_SECRET),
      graphVersion: e.META_GRAPH_VERSION,
    },
    shorteners: { bitly: oauthClient(e.BITLY_CLIENT_ID, e.BITLY_CLIENT_SECRET) },
    billing: { enabled: Boolean(e.STRIPE_SECRET_KEY) },
    ai: { enabled: Boolean(e.AI_SERVICE_URL), url: e.AI_SERVICE_URL },
  };
}

function oauthClient(
  clientId: string | undefined,
  clientSecret: string | undefined,
): OAuthClient | undefined {
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}
