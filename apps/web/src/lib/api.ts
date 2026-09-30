// Typed API client: every call takes a route from @socioboard/contracts, so params, query, body and
// the response are checked against the same definitions the API validates with.
import {
  ErrorEnvelope,
  pathParams,
  type RouteBodyInput,
  type RouteDefinition,
  type RouteQueryInput,
  type RouteResponse,
} from '@socioboard/contracts';
import type { z } from 'zod';

/** A non-2xx answer, or no answer at all (status 0: network failure). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId: string | undefined,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const NETWORK_ERROR = 'NETWORK_ERROR';
/** A success status whose body isn't JSON (e.g. an HTML page from a misconfigured proxy). */
export const INVALID_RESPONSE = 'INVALID_RESPONSE';

type Params<R extends RouteDefinition> = R['params'] extends z.ZodType
  ? { params: z.input<R['params']> }
  : { params?: never };
type Query<R extends RouteDefinition> = R['query'] extends z.ZodType
  ? { query?: RouteQueryInput<R> }
  : { query?: never };
type Body<R extends RouteDefinition> = R['body'] extends z.ZodType
  ? { body: RouteBodyInput<R> }
  : { body?: never };

export type CallInput<R extends RouteDefinition> = Params<R> &
  Query<R> &
  Body<R> & {
    signal?: AbortSignal;
    /** Extra request headers, e.g. `Idempotency-Key` on publish-now. */
    headers?: Record<string, string>;
  };

/** Required keys only when the route has params or a body; otherwise the input can be left out. */
type CallArgs<R extends RouteDefinition> = R['params'] extends z.ZodType
  ? [input: CallInput<R>]
  : R['body'] extends z.ZodType
    ? [input: CallInput<R>]
    : [input?: CallInput<R>];

/** Path params are strings (ids, slugs) or numbers. */
type PathParams = Record<string, string | number | null | undefined>;

export function buildPath(route: RouteDefinition, params: PathParams = {}): string {
  let path = route.path;
  for (const name of pathParams(route.path)) {
    const value = params[name];
    if (value === undefined || value === null || value === '') {
      throw new Error(`${route.method} ${route.path}: missing param "${name}"`);
    }
    path = path.replace(`:${name}`, encodeURIComponent(String(value)));
  }
  return path;
}

export function buildQuery(query: Record<string, unknown> | undefined): string {
  if (!query) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(key, String(item as string | number | boolean));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export interface ApiClientOptions {
  /** Prefix for every path; empty in the browser (same origin, /api proxied in dev). */
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export function createApiClient({ baseUrl = '', fetch: customFetch }: ApiClientOptions = {}) {
  // Looked up per call, not captured once, so anything that wraps fetch later still applies.
  const fetch: typeof globalThis.fetch =
    customFetch ?? ((input, init) => globalThis.fetch(input, init));
  return async function call<R extends RouteDefinition>(
    route: R,
    ...[input]: CallArgs<R>
  ): Promise<RouteResponse<R>> {
    const { params, query, body, signal, headers } = (input ?? {}) as {
      params?: PathParams;
      query?: Record<string, unknown>;
      body?: unknown;
      signal?: AbortSignal;
      headers?: Record<string, string>;
    };
    const url = baseUrl + buildPath(route, params) + buildQuery(query);
    let res: Response;
    try {
      res = await fetch(url, {
        method: route.method,
        credentials: 'include',
        headers: {
          ...headers,
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(signal ? { signal } : {}),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(0, NETWORK_ERROR, 'Could not reach the server', undefined);
    }

    const requestId = res.headers.get('x-request-id') ?? undefined;
    const text = await res.text();
    if (res.ok) {
      if (!text) return undefined as RouteResponse<R>;
      try {
        return JSON.parse(text) as RouteResponse<R>;
      } catch {
        throw new ApiError(
          res.status,
          INVALID_RESPONSE,
          'The server sent an unreadable response',
          requestId,
        );
      }
    }

    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = undefined;
    }
    const envelope = ErrorEnvelope.safeParse(parsed);
    if (envelope.success) {
      const { code, message, details } = envelope.data.error;
      throw new ApiError(
        res.status,
        code,
        message,
        envelope.data.error.requestId ?? requestId,
        details,
      );
    }
    throw new ApiError(
      res.status,
      'HTTP_' + String(res.status),
      res.statusText || 'Request failed',
      requestId,
    );
  };
}

export type ApiCall = ReturnType<typeof createApiClient>;

/** The app's client: same origin, cookies included. */
export const api = createApiClient();
