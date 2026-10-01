// The realtime emitter against Valkey/Redis: an event for a room is published on the channel the
// API's Socket.IO adapter listens to (`<prefix>:socket.io#/#<room>#`).
import { randomUUID } from 'node:crypto';

import { Redis } from 'ioredis';
import { afterAll, describe, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createLogger, type Logger } from '../logger';
import { createRealtime, realtimeKey } from '../realtime';

const config = loadConfig();
const prefix = `sb-test-${randomUUID()}`;
const realtime = createRealtime({
  url: config.redis.url,
  prefix,
  logger: createLogger({ level: 'silent' }),
});
const sub = new Redis(config.redis.url);
afterAll(() => {
  realtime.close();
  sub.disconnect();
});

describe('realtime emitter', () => {
  it('publishes a room’s event on that room’s channel', async () => {
    const channels: string[] = [];
    const got = new Promise<void>((resolve) => {
      sub.on('pmessageBuffer', (_pattern: Buffer, channel: Buffer) => {
        channels.push(channel.toString());
        resolve();
      });
    });
    await sub.psubscribe(`${realtimeKey(prefix)}#*`);
    realtime.emit('user:u1', 'notification.read', { ids: null, unreadCount: 0 });
    await got;
    expect(channels).toEqual([`${prefix}:socket.io#/#user:u1#`]);
  });

  it('Valkey unreachable: logged, never thrown or left unhandled', async () => {
    const warnings: unknown[] = [];
    const logger = { warn: (...args: unknown[]) => warnings.push(args) } as unknown as Logger;
    const down = createRealtime({ url: 'redis://127.0.0.1:1', prefix, logger });
    expect(() => {
      down.emit('user:u1', 'notification.read', { ids: null, unreadCount: 0 });
    }).not.toThrow();
    // Closing fails the pending publish at once; it must land in the log.
    down.close();
    for (let i = 0; i < 50 && warnings.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(warnings).toHaveLength(1);
  });
});
