// Contract tests run adapters against recorded network answers (docs/backend/modules/providers.md,
// Testing). Recordings live in src/__fixtures__/<network>/<name>.json with ids and tokens replaced
// by fakes; `replayFetch` serves them in order and fails on any call the test didn't expect.
import { readFileSync } from 'node:fs';

/** One expected call and the answer to give. */
export interface RecordedCall {
  method: 'GET' | 'POST' | 'DELETE';
  /** Origin + path, without the query. */
  url: string;
  /** Query parameters that must be present with these values (others are ignored). */
  query?: Record<string, string>;
  /** Form or JSON body fields that must be present with these values. */
  body?: Record<string, string>;
  status: number;
  response: unknown;
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
    for (const [key, value] of Object.entries(next.body ?? {})) {
      if (body[key] !== value) {
        fail(`${where}: body ${key}=${String(body[key])}, expected ${value}`);
      }
    }
    const text = typeof next.response === 'string' ? next.response : JSON.stringify(next.response);
    return Promise.resolve(
      new Response(text, {
        status: next.status,
        headers: { 'content-type': 'application/json', ...next.headers },
      }),
    );
  };
  return { fetch: fake, seen, mismatches, remaining: () => [...queue] };
}
