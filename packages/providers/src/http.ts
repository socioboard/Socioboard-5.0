import { ProviderError } from './errors';

/** What adapters log through; the API and worker pass their pino logger. */
export interface ProviderLogger {
  debug(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
}

export interface HttpRequest {
  /** PUT is for upload URLs that take raw bytes (LinkedIn and YouTube chunked uploads). */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Sent as JSON. */
  json?: unknown;
  /** Sent as application/x-www-form-urlencoded. */
  form?: Record<string, string>;
  /** Sent as multipart/form-data (file uploads); fetch sets the boundary. */
  multipart?: FormData;
  /** Sent as is (a binary upload); set its content-type in `headers`. */
  bytes?: Uint8Array;
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
  /**
   * Reads a file (or the byte range [start, end)) from a URL, e.g. our own storage, for uploading
   * it to a network. Anything but a 2xx answer, or more than `maxBytes`, is a `retryable` error.
   */
  download(
    url: string,
    opts?: { range?: { start: number; end: number }; maxBytes?: number; timeoutMs?: number },
  ): Promise<Uint8Array>;
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
      let body: string | FormData | Uint8Array | undefined;
      if (req.json !== undefined) {
        headers['content-type'] = 'application/json';
        body = JSON.stringify(req.json);
      } else if (req.form) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams(req.form).toString();
      } else if (req.multipart) {
        body = req.multipart;
      } else if (req.bytes) {
        body = req.bytes;
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

    async download(raw, opts = {}) {
      const url = redactUrl(raw);
      const headers: Record<string, string> = opts.range
        ? { range: `bytes=${String(opts.range.start)}-${String(opts.range.end - 1)}` }
        : {};
      let res: Response;
      try {
        res = await doFetch(raw, {
          headers,
          signal: AbortSignal.timeout(opts.timeoutMs ?? defaultTimeout),
        });
      } catch (err) {
        options.logger?.warn({ network: options.name, url }, 'reading a file failed');
        throw new ProviderError({
          kind: 'retryable',
          message: 'Could not read the file to upload',
          cause: err,
        });
      }
      const size = Number(res.headers.get('content-length') ?? '0');
      if (!res.ok || (opts.maxBytes !== undefined && size > opts.maxBytes)) {
        throw new ProviderError({
          kind: 'retryable',
          message: res.ok
            ? 'The file is larger than this upload allows'
            : `Reading the file answered HTTP ${String(res.status)}`,
          status: res.status,
        });
      }
      return new Uint8Array(await res.arrayBuffer());
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
