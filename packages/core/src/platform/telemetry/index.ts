// OpenTelemetry (docs/infra.md#observability): traces, metrics and logs over OTLP/HTTP to any
// collector (self-hosted OpenObserve), off unless OTEL_EXPORTER_OTLP_ENDPOINT is set. The api and
// worker run as bundles, so nothing here patches modules as they load: requests are traced by
// our own middleware (./http), `fetch` through its diagnostics channels, Prisma through its own
// tracing and BullMQ through its telemetry option.
import {
  context,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  metrics,
  propagation,
  trace,
  type Span,
} from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { UndiciInstrumentation, type UndiciRequest } from '@opentelemetry/instrumentation-undici';
import {
  defaultResource,
  detectResources,
  envDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
  SimpleLogRecordProcessor,
  type LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_URL_FULL,
  ATTR_URL_QUERY,
} from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

export { traceRequests, setRouteName } from './http';
export { recordDelivery } from './metrics';

export interface Telemetry {
  /** Whether anything is exported (an endpoint is set). */
  enabled: boolean;
  /** Sends what is buffered and stops; never takes longer than `timeoutMs`. */
  shutdown(timeoutMs?: number): Promise<void>;
}

export interface TelemetryOptions {
  /** `socioboard-api`, `socioboard-worker`. */
  serviceName: string;
  /** OTEL_EXPORTER_OTLP_ENDPOINT; undefined turns telemetry off. */
  endpoint: string | undefined;
  /** NODE_ENV, as `deployment.environment.name`. */
  environment: string;
  /**
   * Tests: in-memory exporters, sent without batching. Metrics are read on `shutdown()` (or
   * through the reader's `forceFlush`).
   */
  exporters?: { spans: SpanExporter; logs: LogRecordExporter; metrics?: PushMetricExporter };
}

const off: Telemetry = { enabled: false, shutdown: () => Promise.resolve() };

const DIAG_LEVELS: Record<string, DiagLogLevel> = {
  error: DiagLogLevel.ERROR,
  warn: DiagLogLevel.WARN,
  info: DiagLogLevel.INFO,
  debug: DiagLogLevel.DEBUG,
  verbose: DiagLogLevel.VERBOSE,
};

/**
 * A network's URL can carry an access token in its query string (Graph API calls, presigned
 * storage URLs): spans keep the address and path only.
 */
export function withoutQuery(span: Span, request: UndiciRequest): void {
  const url = new URL(request.path, request.origin);
  span.setAttribute(ATTR_URL_FULL, `${url.origin}${url.pathname}`);
  if (url.search) span.setAttribute(ATTR_URL_QUERY, '[redacted]');
}

/** Starts the SDK and registers it globally; call before the platform's clients are created. */
export function startTelemetry({
  serviceName,
  endpoint,
  environment,
  exporters,
}: TelemetryOptions): Telemetry {
  if (!endpoint && !exporters) return off;
  // OTEL_LOG_LEVEL (as in every OpenTelemetry SDK): the SDK's own problems, such as exports the
  // collector refused, on stderr. Unset: silent, so a collector that is down doesn't flood logs.
  const diagLevel = DIAG_LEVELS[process.env.OTEL_LOG_LEVEL?.toLowerCase() ?? ''];
  if (diagLevel !== undefined) diag.setLogger(new DiagConsoleLogger(), diagLevel);
  const base = endpoint?.replace(/\/+$/, '') ?? '';
  const resource = defaultResource()
    .merge(detectResources({ detectors: [envDetector] }))
    .merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        'deployment.environment.name': environment,
      }),
    );

  const spanExporter = exporters?.spans ?? new OTLPTraceExporter({ url: `${base}/v1/traces` });
  const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [
      exporters ? new SimpleSpanProcessor(spanExporter) : new BatchSpanProcessor(spanExporter),
    ],
  });
  // Also installs the AsyncLocalStorage context manager and W3C trace-context propagation.
  tracerProvider.register();

  // Tests that don't look at metrics pass no metrics exporter: nothing reads them then.
  const metricExporter = exporters
    ? exporters.metrics
    : new OTLPMetricExporter({ url: `${base}/v1/metrics` });
  const meterProvider = new MeterProvider({
    resource,
    readers: metricExporter
      ? [
          new PeriodicExportingMetricReader({
            exporter: metricExporter,
            exportIntervalMillis: 30_000,
          }),
        ]
      : [],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const logExporter = exporters?.logs ?? new OTLPLogExporter({ url: `${base}/v1/logs` });
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      exporters
        ? new SimpleLogRecordProcessor({ exporter: logExporter })
        : new BatchLogRecordProcessor({ exporter: logExporter }),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  const unregister = registerInstrumentations({
    tracerProvider,
    meterProvider,
    instrumentations: [
      new UndiciInstrumentation({ requestHook: withoutQuery }),
      new PrismaInstrumentation(),
    ],
  });

  let stopped: Promise<void> | undefined;
  return {
    enabled: true,
    shutdown(timeoutMs = 5_000) {
      stopped ??= (async () => {
        const flushed = Promise.allSettled([
          tracerProvider.shutdown(),
          meterProvider.shutdown(),
          loggerProvider.shutdown(),
        ]);
        await Promise.race([
          flushed,
          new Promise((resolve) => setTimeout(resolve, timeoutMs).unref()),
        ]);
        unregister();
        // Released, so a test (or a restart in the same process) can register again.
        trace.disable();
        metrics.disable();
        logs.disable();
        propagation.disable();
        context.disable();
        diag.disable();
      })();
      return stopped;
    },
  };
}
