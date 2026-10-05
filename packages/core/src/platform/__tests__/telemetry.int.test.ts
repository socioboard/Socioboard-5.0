// P2-I1 against Valkey: with telemetry on, a job continues the trace of whoever queued it (an API
// request), and a job that throws is an exception on its span; a job moved back to delayed (how
// a processor waits out a rate limit) isn't.
import { randomUUID } from 'node:crypto';

import { SpanStatusCode, trace } from '@opentelemetry/api';
import { InMemoryLogRecordExporter } from '@opentelemetry/sdk-logs';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { loadConfig } from '../config';
import { createLogger } from '../logger';
import { createQueues, defineQueue, DelayedError, type Queues } from '../queue';
import { startTelemetry, type Telemetry } from '../telemetry';

const spans = new InMemorySpanExporter();
let telemetry: Telemetry;
let queues: Queues;

beforeAll(() => {
  telemetry = startTelemetry({
    serviceName: 'socioboard-test',
    endpoint: undefined,
    environment: 'test',
    exporters: { spans, logs: new InMemoryLogRecordExporter() },
  });
  queues = createQueues({
    url: loadConfig().redis.url,
    logger: createLogger({ level: 'silent' }),
    prefix: `sb-test-otel-${randomUUID().slice(0, 8)}`,
    telemetry: true,
  });
});

afterAll(async () => {
  await queues.close(5_000);
  await telemetry.shutdown();
});

/** Resolves once `count` spans whose name contains `part` have ended. */
async function spansNamed(part: string, count = 1) {
  await expect
    .poll(() => spans.getFinishedSpans().filter((s) => s.name.includes(part)).length, {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(count);
  return spans.getFinishedSpans().filter((s) => s.name.includes(part));
}

it('a job runs in the trace of the request that queued it', async () => {
  const def = defineQueue<{ n: number }>('otel-ok', () => Promise.resolve());
  queues.startWorker(def);
  let traceId = '';
  await trace.getTracer('test').startActiveSpan('POST /api/v1/posts', async (span) => {
    traceId = span.spanContext().traceId;
    await queues.get(def).add('run', { n: 1 });
    span.end();
  });
  const [processed] = await spansNamed('process otel-ok');
  expect(processed?.spanContext().traceId).toBe(traceId);
  expect(processed?.status.code).not.toBe(SpanStatusCode.ERROR);
  // The job returned nothing: its "completed" event must not carry an empty result, which the
  // JSON exporter writes as {} and OpenObserve refuses (the whole batch is lost).
  const events = processed?.events ?? [];
  expect(events.length).toBeGreaterThan(0);
  const values = events.flatMap((e) => Object.values(e.attributes ?? {}));
  expect(values).not.toContain(undefined);
});

it('a job that throws is an exception on its span', async () => {
  const def = defineQueue('otel-fail', () => Promise.reject(new Error('Graph API is down')), {
    jobDefaults: { attempts: 1 },
  });
  queues.startWorker(def);
  await queues.get(def).add('run', {});
  const [processed] = await spansNamed('process otel-fail');
  expect(processed?.status.code).toBe(SpanStatusCode.ERROR);
  const exception = processed?.events.find((e) => e.name === 'exception');
  expect(exception?.attributes?.['exception.message']).toBe('Graph API is down');
});

it('a job moved back to delayed is waiting, not failing', async () => {
  let runs = 0;
  const def = defineQueue('otel-wait', async (job, token) => {
    runs += 1;
    if (runs === 1) {
      await job.moveToDelayed(Date.now() + 50, token);
      throw new DelayedError();
    }
  });
  queues.startWorker(def);
  await queues.get(def).add('run', {});
  const processed = await spansNamed('process otel-wait', 2);
  expect(processed.every((s) => !s.events.some((e) => e.name === 'exception'))).toBe(true);
});
