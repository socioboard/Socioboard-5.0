// P2-I1: what OpenTelemetry records (docs/infra.md#observability), through in-memory exporters:
// request spans named by route, never a query string; server errors as exceptions; fetch spans
// without the query (tokens ride there); logs joined to their trace and still redacted; the
// delivery counter. Nothing is exported over the network here.
import { once } from 'node:events';
import { createServer, get, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Writable } from 'node:stream';

import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InMemoryLogRecordExporter } from '@opentelemetry/sdk-logs';
import { AggregationTemporality, InMemoryMetricExporter } from '@opentelemetry/sdk-metrics';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createErrorHandler } from '../http';
import { createLogger } from '../logger';
import {
  recordDelivery,
  setRouteName,
  startTelemetry,
  traceRequests,
  type Telemetry,
} from '../telemetry';
import { resetMetricsForTests } from '../telemetry/metrics';

const spans = new InMemorySpanExporter();
const logs = new InMemoryLogRecordExporter();
const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
let telemetry: Telemetry;
let server: Server;
let base = '';

/** What the API's pipeline does around a handler: trace, route name, error envelope. */
function app() {
  const a = express();
  a.use(traceRequests());
  a.get('/api/v1/things/:thingId', (_req, res) => {
    setRouteName(res, '/api/v1/things/:thingId');
    res.json({ ok: true });
  });
  a.get('/api/v1/boom', (_req, res) => {
    setRouteName(res, '/api/v1/boom');
    throw new Error('database fell over');
  });
  a.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  a.get('/public-media/abc/file.png', (_req, res) => {
    res.send('png');
  });
  a.use(createErrorHandler(createLogger({ level: 'silent' })));
  return a;
}

const finished = (name: string) => spans.getFinishedSpans().filter((s) => s.name === name);

beforeAll(async () => {
  telemetry = startTelemetry({
    serviceName: 'socioboard-test',
    endpoint: undefined,
    environment: 'test',
    exporters: { spans, logs, metrics },
  });
  resetMetricsForTests();
  server = createServer(app());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  server.close();
  await telemetry.shutdown();
});

beforeEach(() => {
  spans.reset();
  logs.reset();
});

describe('switch', () => {
  it('without an endpoint nothing starts', async () => {
    const off = startTelemetry({ serviceName: 'x', endpoint: undefined, environment: 'test' });
    expect(off.enabled).toBe(false);
    await off.shutdown();
    expect(telemetry.enabled).toBe(true);
  });
});

describe('requests', () => {
  it('one server span named by the route, without the query string', async () => {
    await fetch(`${base}/api/v1/things/42?code=secret-oauth-code`);
    const [span] = finished('GET /api/v1/things/:thingId');
    expect(span?.attributes).toMatchObject({
      'http.request.method': 'GET',
      'http.route': '/api/v1/things/:thingId',
      'http.response.status_code': 200,
      'url.path': '/api/v1/things/42',
    });
    expect(JSON.stringify(span?.attributes)).not.toContain('secret-oauth-code');
    expect(span?.status.code).not.toBe(SpanStatusCode.ERROR);
  });

  it('a server error is an exception on the span, which is marked failed', async () => {
    const res = await fetch(`${base}/api/v1/boom`);
    expect(res.status).toBe(500);
    const [span] = finished('GET /api/v1/boom');
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    const exception = span?.events.find((e) => e.name === 'exception');
    expect(exception?.attributes?.['exception.message']).toBe('database fell over');
  });

  it('routes outside the contract are grouped by their first segment, not by file or id', async () => {
    await fetch(`${base}/public-media/abc/file.png`);
    expect(finished('GET /public-media/*')).toHaveLength(1);
  });

  it('health checks make no spans', async () => {
    await fetch(`${base}/api/health`);
    expect(spans.getFinishedSpans().filter((s) => s.name.includes('health'))).toHaveLength(0);
  });

  it('a caller’s trace is continued (W3C traceparent)', async () => {
    const traceId = '0af7651916cd43dd8448eb211c80319c';
    // node:http, not fetch: this process's fetch is traced and would send its own traceparent.
    await new Promise<void>((resolve, reject) => {
      get(
        `${base}/api/v1/things/1`,
        { headers: { traceparent: `00-${traceId}-b7ad6b7169203331-01` } },
        (res) => {
          res.resume();
          res.on('end', resolve);
        },
      ).on('error', reject);
    });
    const [span] = finished('GET /api/v1/things/:thingId');
    expect(span?.spanContext().traceId).toBe(traceId);
  });
});

describe('outgoing calls (fetch)', () => {
  it('keep the address and path, never the query string', async () => {
    await trace.getTracer('test').startActiveSpan('job', async (parent) => {
      await fetch(`${base}/api/v1/things/7?access_token=EAAB-secret-token`);
      parent.end();
    });
    const client = spans.getFinishedSpans().find((s) => s.kind === SpanKind.CLIENT);
    expect(client?.attributes['url.full']).toBe(`${base}/api/v1/things/7`);
    expect(client?.attributes['url.query']).toBe('[redacted]');
    expect(JSON.stringify(client?.attributes)).not.toContain('EAAB-secret-token');
  });
});

describe('logs', () => {
  it('each line goes out with its trace, its fields and its error, still redacted', () => {
    const lines: string[] = [];
    const logger = createLogger({
      level: 'info',
      exportLogs: true,
      destination: new Writable({
        write(chunk: Buffer, _enc, done) {
          lines.push(chunk.toString());
          done();
        },
      }),
    });
    let traceId = '';
    trace.getTracer('test').startActiveSpan('work', (span) => {
      traceId = span.spanContext().traceId;
      logger.error(
        { err: new Error('Graph said no'), accessToken: 'EAAB-secret', network: 'facebook_page' },
        'publish failed',
      );
      span.end();
    });
    const [record] = logs.getFinishedLogRecords();
    expect(record?.body).toBe('publish failed');
    expect(record?.severityText).toBe('ERROR');
    expect(record?.spanContext?.traceId).toBe(traceId);
    expect(record?.attributes).toMatchObject({
      network: 'facebook_page',
      accessToken: '[redacted]',
      'exception.type': 'Error',
      'exception.message': 'Graph said no',
    });
    // The line itself carries the ids too, for anyone reading the logs without OpenObserve.
    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({ trace_id: traceId });
  });

  it('without export, lines are only written', () => {
    const logger = createLogger({
      level: 'info',
      destination: new Writable({
        write: (_c, _e, done) => {
          done();
        },
      }),
    });
    logger.info('quiet');
    expect(logs.getFinishedLogRecords()).toHaveLength(0);
  });
});

describe('metrics', () => {
  it('counts final deliveries by network and outcome', async () => {
    recordDelivery('facebook_page', 'failed');
    recordDelivery('facebook_page', 'failed');
    recordDelivery('instagram_business', 'published');
    await telemetry.shutdown();
    const points = metrics
      .getMetrics()
      .flatMap((r) => r.scopeMetrics)
      .flatMap((s) => s.metrics)
      .filter((m) => m.descriptor.name === 'socioboard.publish.deliveries')
      .flatMap((m) => m.dataPoints as { attributes: Record<string, unknown>; value: unknown }[]);
    const value = (network: string, outcome: string) =>
      points.find((p) => p.attributes.network === network && p.attributes.outcome === outcome)
        ?.value;
    expect(value('facebook_page', 'failed')).toBe(2);
    expect(value('instagram_business', 'published')).toBe(1);
  });
});
