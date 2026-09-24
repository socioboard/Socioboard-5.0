import { Writable } from 'node:stream';

import { pino } from 'pino';
import { describe, expect, it, vi } from 'vitest';

import { createFixedClock } from '../clock';
import { createEventBus } from '../events';
import { createLogger, runWithLogContext } from '../logger';

function capture() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _enc, cb) {
      lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
      cb();
    },
  });
  return { lines, stream };
}

interface TestEvents extends Record<string, unknown> {
  'post.created': { postId: string };
}

describe('event bus', () => {
  it('delivers to every handler even when one fails, and supports unsubscribe', async () => {
    const { lines, stream } = capture();
    const bus = createEventBus<TestEvents>({ logger: pino(stream) });
    const ok = vi.fn();
    bus.on('post.created', () => {
      throw new Error('handler broke');
    });
    const off = bus.on('post.created', ok);

    await bus.emit('post.created', { postId: 'p1' });
    expect(ok).toHaveBeenCalledWith({ postId: 'p1' });
    expect(lines.some((l) => l.msg === 'event handler failed')).toBe(true);

    off();
    await bus.emit('post.created', { postId: 'p2' });
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it('emitDurable hands the event to the queue sink first', async () => {
    const durable = vi.fn(() => Promise.resolve());
    const bus = createEventBus<TestEvents>({ logger: pino({ level: 'silent' }), durable });
    await bus.emitDurable('post.created', { postId: 'p1' });
    expect(durable).toHaveBeenCalledWith('post.created', { postId: 'p1' });

    const noSink = createEventBus<TestEvents>({ logger: pino({ level: 'silent' }) });
    await expect(noSink.emitDurable('post.created', { postId: 'p1' })).rejects.toThrow(
      /no durable sink/,
    );
  });
});

describe('logger', () => {
  it('redacts tokens and secrets', () => {
    const { lines, stream } = capture();
    const logger = createLogger({ level: 'info', destination: stream });
    logger.info({ account: { accessToken: 'abc', name: 'Page' }, user: { password: 'pw' } }, 'x');
    expect(lines[0]?.account).toEqual({ accessToken: '[redacted]', name: 'Page' });
    expect(lines[0]?.user).toEqual({ password: '[redacted]' });
  });

  it('adds nested request context to lines, across awaits', async () => {
    const { lines, stream } = capture();
    const logger = createLogger({ level: 'info', destination: stream });
    await runWithLogContext({ requestId: 'r1' }, async () => {
      await Promise.resolve();
      runWithLogContext({ workspaceId: 'w1' }, () => {
        logger.info('inside');
      });
    });
    logger.info('outside');
    expect(lines[0]).toMatchObject({ requestId: 'r1', workspaceId: 'w1', msg: 'inside' });
    expect(lines[1]).not.toHaveProperty('requestId');
  });
});

describe('fixed clock', () => {
  it('can be set and advanced', () => {
    const clock = createFixedClock(new Date('2026-01-01T00:00:00Z'));
    clock.advance(60_000);
    expect(clock.now().toISOString()).toBe('2026-01-01T00:01:00.000Z');
    clock.set(new Date('2027-01-01T00:00:00Z'));
    expect(clock.now().getUTCFullYear()).toBe(2027);
  });
});
