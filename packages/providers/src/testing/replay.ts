// Contract tests run adapters against recorded network answers (docs/backend/modules/providers.md,
// Testing). Recordings live in src/__fixtures__/<network>/<name>.json with ids and tokens replaced
// by fakes; `replayFetch` serves them in order and fails on any call the test didn't expect.
import { readFileSync } from 'node:fs';

/** One expected call and the answer to give. */
export interface RecordedCall {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Origin + path, without the query. */
  url: string;
  /** Query parameters that must be present with these values (others are ignored). */
  query?: Record<string, string>;
  /**
   * Body fields that must be present with these values: form, JSON or multipart fields (a
   * multipart file reads `file:<filename>:<bytes>`); a raw binary body reads `bytes: <count>`.
   */
  body?: Record<string, string>;
  /** Request headers that must be present with these values (lowercase names). */
  requestHeaders?: Record<string, string>;
  status: number;
  /** JSON (or text) answer; ignored when `responseBytes` is set. */
  response?: unknown;
  /** Answer with this many bytes of binary content instead (a file download). */
  responseBytes?: number;
  headers?: Record<string, string>;
}

export interface SeenRequest {
  method: string;
  url: URL;
  body: Record<string, string>;
}

export interface Replay {
  fetch: typeof fetch;
  /** Every request the adapter made, in order. */
  seen: SeenRequest[];
  /** Calls not made yet; a finished test expects none. */
  remaining(): RecordedCall[];
  /**
   * Calls that didn't match the recording. The adapter sees them as a failed request (which the
   * HTTP client reports as "could not reach"), so tests check this list for the real reason.
   */
  mismatches: string[];
}

/** A recording from src/__fixtures__/<network>/<name>.json: one call or several. */
export function fixture(network: string, name: string): RecordedCall[] {
  const file = new URL(`../__fixtures__/${network}/${name}.json`, import.meta.url);
  const data = JSON.parse(readFileSync(file, 'utf8')) as RecordedCall | RecordedCall[];
  return Array.isArray(data) ? data : [data];
}

function readBody(init: RequestInit | undefined): Record<string, string> {
  const raw = init?.body;
  if (raw instanceof FormData) {
    const fields: Record<string, string> = {};
    for (const [k, v] of raw.entries()) {
      fields[k] = typeof v === 'string' ? v : `file:${v.name}:${String(v.size)}`;
    }
    return fields;
  }
  if (raw instanceof Uint8Array) return { bytes: String(raw.byteLength) };
  if (typeof raw !== 'string' || raw === '') return {};
  const type = new Headers(init?.headers).get('content-type') ?? '';
  if (type.includes('json')) {
    const json = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, JSON.stringify(v)]));
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

export function replayFetch(calls: RecordedCall[]): Replay {
  const queue = [...calls];
  const seen: SeenRequest[] = [];
  const mismatches: string[] = [];
  const fail = (message: string): never => {
    mismatches.push(message);
    throw new Error(message);
  };
  const fake = (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input);
    const method = init?.method ?? 'GET';
    const body = readBody(init);
    seen.push({ method, url, body });
    const next = queue.shift();
    const where = `${method} ${url.origin}${url.pathname}`;
    if (!next) return fail(`Unexpected call: ${where}`);
    if (next.method !== method || next.url !== `${url.origin}${url.pathname}`) {
      return fail(`Expected ${next.method} ${next.url}, got ${where}`);
    }
    for (const [key, value] of Object.entries(next.query ?? {})) {
      const actual = url.searchParams.get(key);
      if (actual !== value) fail(`${where}: query ${key}=${String(actual)}, expected ${value}`);
    }
    const sentHeaders = new Headers(init?.headers);
    for (const [key, value] of Object.entries(next.requestHeaders ?? {})) {
      if (sentHeaders.get(key) !== value) {
        fail(`${where}: header ${key}=${String(sentHeaders.get(key))}, expected ${value}`);
      }
    }
    for (const [key, value] of Object.entries(next.body ?? {})) {
      if (body[key] !== value) {
        fail(`${where}: body ${key}=${String(body[key])}, expected ${value}`);
      }
    }
    if (next.responseBytes !== undefined) {
      return Promise.resolve(
        new Response(new Uint8Array(next.responseBytes).fill(7), {
          status: next.status,
          headers: {
            'content-type': 'application/octet-stream',
            'content-length': String(next.responseBytes),
            ...next.headers,
          },
        }),
      );
    }
    const text = typeof next.response === 'string' ? next.response : JSON.stringify(next.response);
    // 204, 205 and 304 answers carry no body (Response refuses one), e.g. LinkedIn's deletes.
    const noBody = [204, 205, 304].includes(next.status);
    return Promise.resolve(
      new Response(noBody ? null : text, {
        status: next.status,
        headers: { 'content-type': 'application/json', ...next.headers },
      }),
    );
  };
  return { fetch: fake, seen, mismatches, remaining: () => [...queue] };
}
