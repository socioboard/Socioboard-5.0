// Browser errors to the API (docs/backend/modules/platform.md, "telemetry"), which logs them and
// passes them to OpenObserve with the server's. Only crashes: an error the API answered (ApiError)
// was already logged there, and the screens show it.
import { telemetryRoutes, type ClientErrorReport } from '@socioboard/contracts';

import { ApiError } from './api';

/** Reports per page load at most: a loop that throws shouldn't flood the API. */
const MAX_REPORTS = 20;
/** The same error again within this long isn't sent again. */
const REPEAT_MS = 60_000;

/**
 * Browser messages that aren't bugs: Chrome's ResizeObserver warning (layout settled a frame late,
 * e.g. while dragging on the calendar) and "Script error.", all a cross-origin script lets us see.
 */
const NOISE = [/^ResizeObserver loop/, /^Script error\.?$/];

type Send = (report: ClientErrorReport) => void;

/** Sent with `keepalive`, so it survives the page closing; failures are ignored. */
const sendToApi: Send = (report) => {
  void fetch(telemetryRoutes.reportClientError.path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify(report),
  }).catch(() => undefined);
};

/** What a report says about an error, cut to the contract's limits. */
export function toReport(
  kind: ClientErrorReport['kind'],
  error: unknown,
  path: string,
): ClientErrorReport | null {
  if (error instanceof ApiError) return null;
  const err = error instanceof Error ? error : null;
  const message = (err?.message ?? (typeof error === 'string' ? error : String(error))).trim();
  if (!message || NOISE.some((n) => n.test(message))) return null;
  const page = path.split(/[?#]/)[0]?.slice(0, 512) ?? '';
  return {
    kind,
    ...(err?.name ? { name: err.name.slice(0, 200) } : {}),
    message: message.slice(0, 1000),
    ...(err?.stack ? { stack: err.stack.slice(0, 8000) } : {}),
    path: page.startsWith('/') ? page : '/',
  };
}

/**
 * The reporter: `report(kind, error)` sends one, at most MAX_REPORTS a page load and once a minute
 * per message. `now` and `send` are for tests.
 */
export function createErrorReporter({
  send = sendToApi,
  now = () => Date.now(),
  path = () => window.location.pathname,
}: { send?: Send; now?: () => number; path?: () => string } = {}) {
  const lastSent = new Map<string, number>();
  let sent = 0;
  return (kind: ClientErrorReport['kind'], error: unknown) => {
    try {
      const report = toReport(kind, error, path());
      if (!report || sent >= MAX_REPORTS) return;
      const key = `${report.kind}:${report.message}`;
      const last = lastSent.get(key);
      if (last !== undefined && now() - last < REPEAT_MS) return;
      lastSent.set(key, now());
      sent += 1;
      send(report);
    } catch {
      // Reporting must never become the next error.
    }
  };
}

export type ErrorReporter = ReturnType<typeof createErrorReporter>;

/** Uncaught errors and unhandled promise rejections, for the life of the page. */
export function installErrorReporting(report: ErrorReporter, target: Window = window): void {
  target.addEventListener('error', (event) => {
    report('error', event.error ?? event.message);
  });
  target.addEventListener('unhandledrejection', (event) => {
    report('unhandledrejection', event.reason);
  });
}
