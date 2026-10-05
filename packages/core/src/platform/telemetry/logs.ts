import { isSpanContextValid, trace } from '@opentelemetry/api';
import { logs, SeverityNumber, type AnyValueMap } from '@opentelemetry/api-logs';

// Pino's numeric levels and OpenTelemetry's severity for each.
const SEVERITY: Record<number, [SeverityNumber, string]> = {
  10: [SeverityNumber.TRACE, 'TRACE'],
  20: [SeverityNumber.DEBUG, 'DEBUG'],
  30: [SeverityNumber.INFO, 'INFO'],
  40: [SeverityNumber.WARN, 'WARN'],
  50: [SeverityNumber.ERROR, 'ERROR'],
  60: [SeverityNumber.FATAL, 'FATAL'],
};

/** Fields Pino writes on every line; the log record has its own slots for them. */
const OWN_FIELDS = new Set(['level', 'time', 'msg', 'pid', 'hostname', 'trace_id', 'span_id']);

/**
 * The current span's ids, added to every log line written inside a traced request or job, so a
 * line found in the logs leads to its trace (and OpenObserve links them).
 */
export function traceFields(): { trace_id?: string; span_id?: string } {
  const ctx = trace.getActiveSpan()?.spanContext();
  return ctx && isSpanContextValid(ctx) ? { trace_id: ctx.traceId, span_id: ctx.spanId } : {};
}

/**
 * Sends one finished Pino line (already redacted) as an OpenTelemetry log record, in the current
 * context so it joins its trace. An `err` becomes the exception attributes OpenObserve shows.
 */
export function exportLogLine(line: string): void {
  let entry: Record<string, unknown>;
  try {
    entry = JSON.parse(line) as Record<string, unknown>;
  } catch {
    return;
  }
  const [severityNumber, severityText] = SEVERITY[Number(entry.level)] ?? [
    SeverityNumber.INFO,
    'INFO',
  ];
  const attributes: AnyValueMap = {};
  for (const [key, value] of Object.entries(entry)) {
    if (OWN_FIELDS.has(key) || value === undefined) continue;
    if (key === 'err' && value && typeof value === 'object') {
      const err = value as { type?: unknown; message?: unknown; stack?: unknown };
      if (typeof err.type === 'string') attributes['exception.type'] = err.type;
      if (typeof err.message === 'string') attributes['exception.message'] = err.message;
      if (typeof err.stack === 'string') attributes['exception.stacktrace'] = err.stack;
      continue;
    }
    attributes[key] = value as AnyValueMap[string];
  }
  logs.getLogger('socioboard').emit({
    severityNumber,
    severityText,
    body: typeof entry.msg === 'string' ? entry.msg : '',
    ...(typeof entry.time === 'number' ? { timestamp: entry.time } : {}),
    attributes,
  });
}
