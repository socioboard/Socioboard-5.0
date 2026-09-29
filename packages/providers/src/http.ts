import { ProviderError } from './errors';

/** What adapters log through; the API and worker pass their pino logger. */
export interface ProviderLogger {
  debug(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
}

export interface HttpRequest {
  method?: 'GET' | 'POST' | 'DELETE';
  url: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Sent as JSON. */
  json?: unknown;
  /** Sent as application/x-www-form-urlencoded. */
  form?: Record<string, string>;
  headers?: Record<string, string>;
  /** Overrides the client's timeout (video uploads take longer). */
  timeoutMs?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  headers: Headers;
  /** Parsed JSON when the network sent JSON, else the text. */
  body: T;
}

export interface HttpClient {
  /**
   * Resolves for every answer, including 4xx/5xx: each network words its errors differently, so
   * adapters read them. Throws a `retryable` ProviderError only when no answer came (timeout,
   * DNS, connection reset).
   */
  request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>>;
}

export interface HttpClientOptions {
  /** For logs, e.g. "meta". */
  name: string;
  fetch?: typeof fetch;
  /** Per call (docs/backend/modules/publishing.md: 60 s). */
  timeoutMs?: number;
  logger?: ProviderLogger;
}

export const DEFAULT_TIMEOUT_MS = 60_000;

/** Query parameters that carry secrets; their values never reach a log line. */
const SECRET_PARAM = /token|secret|code|password|proof|signature|key/i;

/** The URL with secret query values replaced, for logs and error messages. */
export function redactUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return '[invalid url]';
  }
  for (const name of [...url.searchParams.keys()]) {
    if (SECRET_PARAM.test(name)) url.searchParams.set(name, '[redacted]');
  }
  return url.toString();
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const doFetch = options.fetch ?? fetch;
  const defaultTimeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
      const method = req.method ?? 'GET';
      const url = new URL(req.url);
      for (const [key, value] of Object.entries(req.query ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
      const headers: Record<string, string> = { accept: 'application/json', ...req.headers };
      let body: string | undefined;
      if (req.json !== undefined) {
        headers['content-type'] = 'application/json';
        body = JSON.stringify(req.json);
      } else if (req.form) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(req.form).toString();
      }

      const started = Date.now();
      const logged = { network: options.name, method, url: redactUrl(url.toString()) };
      let res: Response;
      try {
        res = await doFetch(url, {
          method,
          headers,
          ...(body === undefined ? {} : { body }),
          signal: AbortSignal.timeout(req.timeoutMs ?? defaultTimeout),
        });
      } catch (err) {
        const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
        options.logger?.warn(
          { ...logged, ms: Date.now() - started, timedOut },
          'network call failed',
        );
        throw new ProviderError({
          kind: 'retryable',
          message: timedOut
            ? `${options.name} did not answer in time`
            : `Could not reach ${options.name}`,
          cause: err,
        });
      }

      const text = await res.text();
      let parsed: unknown = text;
      if (res.headers.get('content-type')?.includes('json') && text !== '') {
        try {
          parsed = parseJson(text);
        } catch {
          // Keep the text: a proxy error page labelled as JSON.
        }
      }
      options.logger?.debug(
        { ...logged, status: res.status, ms: Date.now() - started },
        'network call',
      );
      return { status: res.status, ok: res.ok, headers: res.headers, body: parsed as T };
    },
  };
}

/**
 * JSON.parse, except integers too large for a JS number (Meta's 17-digit Instagram ids, sent as
 * numbers by some endpoints) keep their exact digits as strings instead of being rounded.
 */
export function parseJson(text: string): unknown {
  return JSON.parse(text, (_key, value: unknown, context?: { source?: string }) =>
    typeof value === 'number' &&
    Number.isInteger(value) &&
    !Number.isSafeInteger(value) &&
    context?.source
      ? context.source
      : value,
  );
}

/** Seconds from a Retry-After header (seconds or an HTTP date), or null. */
export function retryAfterSec(headers: Headers, now = Date.now()): number | null {
  const value = headers.get('retry-after');
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const at = Date.parse(value);
  return Number.isNaN(at) ? null : Math.max(0, Math.ceil((at - now) / 1000));
}
