// Runs against the local services (`pnpm services:up`), using the root .env.
import { randomUUID } from 'node:crypto';

import { pino } from 'pino';
import { afterAll, describe, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createLogger } from '../logger';
import { createPlatform } from '../services';
import { createDb } from '../db';
import { createMailer } from '../mailer';
import { createQueues, defineQueue } from '../queue';
import { createStorage } from '../storage';

const config = loadConfig();
const logger = pino({ level: 'silent' });

describe('postgres', () => {
  const db = createDb({ url: config.db.url, poolSize: 2, scopedModels: [] });
  afterAll(() => db.close());

  it('connects', async () => {
    expect(await db.ping()).toBe(true);
  });
});

describe('queue (Valkey/Redis)', () => {
  const queues = createQueues({ url: config.redis.url, logger, prefix: `sb-test-${randomUUID()}` });
  afterAll(() => queues.close(5_000));

  it('pings and runs a job end to end', async () => {
    expect(await queues.ping()).toBe(true);

    let resolveDone: (value: string) => void = () => undefined;
    const done = new Promise<string>((r) => (resolveDone = r));
    const echo = defineQueue<{ text: string }>('echo', (job) => {
      resolveDone(job.data.text);
      return Promise.resolve();
    });

    queues.startWorker(echo);
    await queues.get(echo).add('say', { text: 'hello' });
    expect(await done).toBe('hello');
  });

  it('close() forces shutdown when an active job outlives the timeout', async () => {
    const own = createQueues({ url: config.redis.url, logger, prefix: `sb-test-${randomUUID()}` });
    let started: () => void = () => undefined;
    const running = new Promise<void>((r) => (started = r));
    const slow = defineQueue('slow', async () => {
      started();
      await new Promise((r) => setTimeout(r, 60_000));
    });
    own.startWorker(slow);
    await own.get(slow).add('wait', {});
    await running;
    const t0 = Date.now();
    await own.close(500);
    expect(Date.now() - t0).toBeLessThan(5_000);
  });
});

describe('createPlatform', () => {
  it('builds every client from config and closes them all', async () => {
    const platform = createPlatform(config, createLogger({ level: 'silent' }));
    expect(await platform.db.ping()).toBe(true);
    expect(await platform.queues.ping()).toBe(true);
    expect(await platform.mailer.verify()).toBe(true);
    expect(platform.crypto.decrypt(platform.crypto.encrypt('x'))).toBe('x');
    expect(Boolean(platform.storage)).toBe(Boolean(config.storage));
    await platform.close();
  });
});

describe('mailer (Mailpit)', () => {
  const mailer = createMailer({ smtpUrl: config.mail.smtpUrl, from: config.mail.from, logger });
  afterAll(() => {
    mailer.close();
  });

  it.runIf(config.mail.smtpUrl)('sends a message that arrives in Mailpit', async () => {
    const subject = `test ${randomUUID()}`;
    expect(await mailer.verify()).toBe(true);
    await mailer.send({ to: 'someone@example.test', subject, html: '<p>hi</p>', text: 'hi' });

    const uiPort = process.env.MAILPIT_UI_PORT ?? '8025';
    const search = await fetch(
      `http://localhost:${uiPort}/api/v1/search?query=${encodeURIComponent(`subject:"${subject}"`)}`,
    );
    const body = (await search.json()) as { messages_count: number };
    expect(body.messages_count).toBe(1);
  });
});

const storageConfig = config.storage;
describe.runIf(storageConfig)('storage (S3 / MinIO)', () => {
  // The describe body runs even when skipped, so only build the client when configured.
  const storage = storageConfig ? createStorage(storageConfig) : (undefined as never);
  afterAll(() => {
    storage.close();
  });

  it('uploads and downloads through presigned URLs', async () => {
    expect(await storage.ping()).toBe(true);
    const key = `test/${randomUUID()}.txt`;

    const put = await storage.presignPut(key, 'text/plain');
    const upload = await fetch(put, {
      method: 'PUT',
      body: 'hello',
      headers: { 'content-type': 'text/plain' },
    });
    expect(upload.status).toBe(200);
    expect(await storage.head(key)).toMatchObject({ size: 5, contentType: 'text/plain' });

    const get = await fetch(await storage.presignGet(key));
    expect(await get.text()).toBe('hello');

    await storage.delete(key);
    expect(await storage.head(key)).toBeUndefined();
  });

  it('completes a multipart upload', async () => {
    const key = `test/${randomUUID()}.bin`;
    const uploadId = await storage.createMultipart(key, 'application/octet-stream');
    // S3 requires every part except the last to be at least 5 MiB.
    const partData = [Buffer.alloc(5 * 1024 * 1024, 1), Buffer.from('tail')];
    const parts = [];
    for (const [i, data] of partData.entries()) {
      const url = await storage.presignPart(key, uploadId, i + 1);
      const res = await fetch(url, { method: 'PUT', body: data });
      parts.push({ partNumber: i + 1, etag: res.headers.get('etag') ?? '' });
    }
    await storage.completeMultipart(key, uploadId, parts);
    expect((await storage.head(key))?.size).toBe(5 * 1024 * 1024 + 4);
    await storage.delete(key);
  });
});
