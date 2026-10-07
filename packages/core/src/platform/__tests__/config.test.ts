import { describe, expect, it } from 'vitest';

import { ConfigError, EXAMPLE_AUTH_SECRET, EXAMPLE_ENCRYPTION_KEY, loadConfig } from '../config';

const key = (id: string, fill: number) => `${id}:${Buffer.alloc(32, fill).toString('base64')}`;

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5440/db',
  REDIS_URL: 'redis://localhost:6380',
  ENCRYPTION_KEYS: key('k1', 1),
  AUTH_SECRET: 'x'.repeat(32),
};

describe('loadConfig', () => {
  it('applies defaults and derives feature toggles from which keys are set', () => {
    const config = loadConfig(base);
    expect(config.env).toBe('development');
    expect(config.api.port).toBe(3000);
    expect(config.logLevel).toBe('debug');
    expect(config.storage).toBeUndefined();
    expect(config.mail.smtpUrl).toBeUndefined();
    expect(config.billing.enabled).toBe(false);
    expect(config.ai.enabled).toBe(false);

    const withKeys = loadConfig({
      ...base,
      STRIPE_SECRET_KEY: 'sk_test',
      AI_SERVICE_URL: 'http://ai',
    });
    expect(withKeys.billing.enabled).toBe(true);
    expect(withKeys.ai.enabled).toBe(true);
  });

  it('treats empty strings as unset (the .env.example leaves S3 blank)', () => {
    const config = loadConfig({ ...base, S3_BUCKET: '', SMTP_URL: '' });
    expect(config.storage).toBeUndefined();
    expect(config.mail.smtpUrl).toBeUndefined();
  });

  it('reports every problem at once', () => {
    try {
      loadConfig({ REDIS_URL: 'http://wrong', ENCRYPTION_KEYS: 'k1:short', S3_BUCKET: 'm' });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      const problems = (err as ConfigError).problems.join('\n');
      expect(problems).toContain('DATABASE_URL');
      expect(problems).toContain('REDIS_URL');
      expect(problems).toContain('ENCRYPTION_KEYS: "k1" must be id:base64 with a 32-byte key');
      expect(problems).toContain('S3_REGION');
    }
  });

  it('parses S3 settings for MinIO', () => {
    const config = loadConfig({
      ...base,
      S3_BUCKET: 'media',
      S3_REGION: 'us-east-1',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_FORCE_PATH_STYLE: 'true',
      S3_ACCESS_KEY_ID: 'a',
      S3_SECRET_ACCESS_KEY: 'b',
    });
    expect(config.storage).toEqual({
      driver: 's3',
      bucket: 'media',
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      forcePathStyle: true,
      credentials: { accessKeyId: 'a', secretAccessKey: 'b' },
    });
  });

  it('requires a region with a bucket, and both S3 keys or neither', () => {
    expect(() => loadConfig({ ...base, S3_BUCKET: 'media' })).toThrow(/S3_REGION/);
    expect(() =>
      loadConfig({ ...base, S3_BUCKET: 'media', S3_REGION: 'eu-west-1', S3_ACCESS_KEY_ID: 'a' }),
    ).toThrow(/set together/);
    // No keys at all is fine: the SDK uses the IAM role.
    const s3 = loadConfig({ ...base, S3_BUCKET: 'm', S3_REGION: 'eu-west-1' }).storage;
    expect(s3?.driver === 's3' && s3.credentials).toBeUndefined();
  });

  it('NAS storage: needs its address, public address and token, and wins over S3 settings', () => {
    const nas = {
      STORAGE_DRIVER: 'nas',
      NAS_API_URL: 'http://10.0.0.5:8119/socioboard-dev/',
      NAS_PUBLIC_URL: 'https://media.example.com/',
      NAS_API_TOKEN: 'ak:sk',
    };
    expect(loadConfig({ ...base, ...nas, S3_BUCKET: 'ignored' }).storage).toEqual({
      driver: 'nas',
      apiUrl: 'http://10.0.0.5:8119/socioboard-dev',
      publicUrl: 'https://media.example.com',
      token: 'ak:sk',
      tempDir: undefined,
    });
    expect(() => loadConfig({ ...base, ...nas, NAS_API_TOKEN: '' })).toThrow(/NAS_API_TOKEN/);
    expect(() => loadConfig({ ...base, ...nas, NAS_PUBLIC_URL: undefined })).toThrow(
      /NAS_PUBLIC_URL/,
    );
    expect(() => loadConfig({ ...base, STORAGE_DRIVER: 's3' })).toThrow(/S3_BUCKET/);
    expect(() => loadConfig({ ...base, STORAGE_DRIVER: 'ftp' })).toThrow(/STORAGE_DRIVER/);
    // Empty means unset, as for every optional setting: no storage, not an invalid one.
    expect(loadConfig({ ...base, STORAGE_DRIVER: '' }).storage).toBeUndefined();
    expect(
      loadConfig({ ...base, STORAGE_DRIVER: ' ', S3_BUCKET: 'm', S3_REGION: 'r' }).storage?.driver,
    ).toBe('s3');
  });

  it('parses several encryption keys in order and rejects bad ones', () => {
    const config = loadConfig({ ...base, ENCRYPTION_KEYS: `${key('k2', 2)},${key('k1', 1)}` });
    expect(config.encryption.keys.map((k) => k.id)).toEqual(['k2', 'k1']);
    expect(() => loadConfig({ ...base, ENCRYPTION_KEYS: 'k1:dG9vLXNob3J0' })).toThrow(/32-byte/);
  });

  it('refuses the example dev key in production', () => {
    const env = { ...base, ENCRYPTION_KEYS: `k1:${EXAMPLE_ENCRYPTION_KEY}` };
    expect(() => loadConfig(env)).not.toThrow();
    expect(() => loadConfig({ ...env, NODE_ENV: 'production' })).toThrow(/example dev key/);
  });

  it('requires a 32+ character auth secret and refuses the example one in production', () => {
    expect(() => loadConfig({ ...base, AUTH_SECRET: 'short' })).toThrow(/AUTH_SECRET/);
    const env = { ...base, AUTH_SECRET: EXAMPLE_AUTH_SECRET };
    expect(() => loadConfig(env)).not.toThrow();
    expect(() => loadConfig({ ...env, NODE_ENV: 'production' })).toThrow(/example dev secret/);
  });

  it('turns social sign-in on only when both keys are set', () => {
    expect(loadConfig(base).auth.google).toBeUndefined();
    expect(
      loadConfig({ ...base, GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 's' }).auth.google,
    ).toEqual({ clientId: 'id', clientSecret: 's' });
    expect(() => loadConfig({ ...base, GOOGLE_CLIENT_ID: 'id' })).toThrow(/set together/);
    expect(
      loadConfig({ ...base, MICROSOFT_CLIENT_ID: 'id', MICROSOFT_CLIENT_SECRET: 's' }).auth
        .microsoft,
    ).toEqual({ clientId: 'id', clientSecret: 's', tenantId: 'common' });
  });

  it('turns social networks on only when an app id and secret are set together', () => {
    expect(loadConfig(base).networks).toEqual({
      facebook: undefined,
      instagram: undefined,
      graphVersion: undefined,
    });
    const meta = loadConfig({
      ...base,
      META_APP_ID: '123',
      META_APP_SECRET: 's',
      META_LOGIN_CONFIG_ID: 'cfg',
      INSTAGRAM_APP_ID: '456',
      INSTAGRAM_APP_SECRET: 't',
      META_GRAPH_VERSION: 'v25.0',
    }).networks;
    expect(meta).toEqual({
      facebook: { appId: '123', appSecret: 's', configId: 'cfg' },
      instagram: { appId: '456', appSecret: 't' },
      graphVersion: 'v25.0',
    });
    expect(() => loadConfig({ ...base, META_APP_ID: '123' })).toThrow(/META_APP_ID and/);
    expect(() => loadConfig({ ...base, INSTAGRAM_APP_SECRET: 't' })).toThrow(/INSTAGRAM_APP_ID/);
    expect(() => loadConfig({ ...base, META_GRAPH_VERSION: '25' })).toThrow(/v25\.0/);
    expect(loadConfig({ ...base, META_GRAPH_VERSION: '' }).networks.graphVersion).toBeUndefined();
    // Meta writes versions both ways; the URL needs the "v".
    expect(loadConfig({ ...base, META_GRAPH_VERSION: '25.0' }).networks.graphVersion).toBe('v25.0');
  });

  it('takes an optional public media address', () => {
    expect(loadConfig(base).media.publicUrl).toBeUndefined();
    expect(loadConfig({ ...base, MEDIA_PUBLIC_URL: '' }).media.publicUrl).toBeUndefined();
    expect(
      loadConfig({ ...base, MEDIA_PUBLIC_URL: 'https://media.socioboard.com' }).media.publicUrl,
    ).toBe('https://media.socioboard.com');
    expect(() => loadConfig({ ...base, MEDIA_PUBLIC_URL: 'media.socioboard.com' })).toThrow(
      /MEDIA_PUBLIC_URL/,
    );
  });

  it('checks breached passwords unless turned off', () => {
    expect(loadConfig(base).auth.breachedPasswordCheck).toBe(true);
    expect(
      loadConfig({ ...base, AUTH_BREACHED_PASSWORD_CHECK: 'false' }).auth.breachedPasswordCheck,
    ).toBe(false);
  });
});
