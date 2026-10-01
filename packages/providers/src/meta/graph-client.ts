import { createHmac } from 'node:crypto';

import type { PublishErrorKind } from '@socioboard/contracts';

import { ProviderError, kindFromStatus } from '../errors';
import { retryAfterSec, type HttpClient } from '../http';

/** Graph API version (developers.facebook.com, checked 2026-09-29). Override with META_GRAPH_VERSION. */
export const DEFAULT_GRAPH_VERSION = 'v25.0';

/** Meta's error body: `{ error: { message, type, code, error_subcode, error_user_msg, … } }`. */
interface GraphErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    is_transient?: boolean;
  };
}

/** Meta error codes by what the worker should do (Graph API "Handling errors"). */
const AUTH_CODES = new Set([102, 190, 10, 459, 460, 463, 467]);
// 9: Instagram's 100 posts per 24 hours (subcode 2207042).
/** "Application request limit reached": counts every call the app makes. */
const APP_RATE_CODE = 4;
const RATE_CODES = new Set([4, 9, 17, 32, 341, 613, 80001, 80002, 80004, 80005, 80006]);
const RETRYABLE_CODES = new Set([1, 2]);

export function classifyGraphError(
  status: number,
  body: unknown,
): {
  kind: PublishErrorKind;
  networkCode: string | null;
  message: string;
  limitScope: 'account' | 'app';
} {
  const err = (body as GraphErrorBody | null)?.error;
  if (!err) {
    return {
      kind: kindFromStatus(status),
      networkCode: null,
      message: `Meta answered HTTP ${String(status)}`,
      limitScope: 'account',
    };
  }
  const code = err.code ?? null;
  const networkCode =
    code === null
      ? null
      : err.error_subcode
        ? `${String(code)}/${String(err.error_subcode)}`
        : String(code);
  let kind: PublishErrorKind;
  if (code !== null && AUTH_CODES.has(code)) kind = 'auth';
  // 200–299: a permission the token doesn't have; reconnecting grants it.
  else if (code !== null && code >= 200 && code <= 299) kind = 'auth';
  else if (code !== null && RATE_CODES.has(code)) kind = 'rate_limited';
  else if (err.is_transient || (code !== null && RETRYABLE_CODES.has(code))) kind = 'retryable';
  else if (status >= 500) kind = 'retryable';
  else kind = 'content';
  // error_user_msg is written for end users; message is for developers.
  const message = err.error_user_msg ?? err.message ?? `Meta answered HTTP ${String(status)}`;
  // Code 4 is the app's own limit (every account on it); the others are a Page's, an Instagram
  // account's or a user's.
  const limitScope = code === APP_RATE_CODE ? 'app' : 'account';
  return { kind, networkCode, message, limitScope };
}

export interface GraphClient {
  get<T>(path: string, token: string, query?: Record<string, string | number>): Promise<T>;
  post<T>(
    path: string,
    token: string,
    form: Record<string, string>,
    opts?: PostOptions,
  ): Promise<T>;
  delete(path: string, token: string): Promise<void>;
  /**
   * Sends raw bytes to an upload host (Instagram's rupload), with the token in an
   * `Authorization: OAuth` header as that host wants.
   */
  postBytes<T>(
    fullUrl: string,
    token: string,
    bytes: Uint8Array,
    headers: Record<string, string>,
  ): Promise<T>;
  /** The Graph API version in use (upload hosts put it in their paths). */
  version: string;
  /** For reading files to upload (downloads never carry a token). */
  http: HttpClient;
  /** Follows `paging.next` until the list ends or `maxPages` is reached. */
  getAll<T>(
    path: string,
    token: string,
    query?: Record<string, string | number>,
    maxPages?: number,
  ): Promise<T[]>;
}

interface PostOptions {
  /** graph-video.facebook.com, for video uploads. */
  video?: boolean;
  timeoutMs?: number;
  /** Sends the form as multipart/form-data with this file (photo `source`, video chunks). */
  file?: { field: string; bytes: Uint8Array; filename: string; mime: string };
}

/** Upload timeout: files take longer than the default minute. */
const UPLOAD_TIMEOUT_MS = 5 * 60_000;

/**
 * Calls graph.facebook.com (or graph.instagram.com) with a token, adding `appsecret_proof` so a
 * leaked token can't be used without the app secret. Error answers become ProviderErrors.
 */
export function createGraphClient(input: {
  http: HttpClient;
  appSecret: string;
  version?: string | undefined;
  baseUrl?: string;
  videoBaseUrl?: string;
  /** Send appsecret_proof (graph.facebook.com); graph.instagram.com calls go without it. */
  proof?: boolean;
}): GraphClient {
  const version = input.version ?? DEFAULT_GRAPH_VERSION;
  const base = input.baseUrl ?? 'https://graph.facebook.com';
  const videoBase = input.videoBaseUrl ?? 'https://graph-video.facebook.com';
  const makeProof = (token: string) =>
    createHmac('sha256', input.appSecret).update(token).digest('hex');
  const url = (root: string, path: string) =>
    path.startsWith('https://') ? path : `${root}/${version}/${path.replace(/^\//, '')}`;

  function multipart(fields: Record<string, string>, file: NonNullable<PostOptions['file']>) {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    form.append(file.field, new Blob([file.bytes], { type: file.mime }), file.filename);
    return form;
  }

  async function call<T>(
    method: 'GET' | 'POST' | 'DELETE',
    fullUrl: string,
    token: string,
    params: Record<string, string | number>,
    opts: { timeoutMs?: number | undefined; file?: PostOptions['file'] } = {},
  ): Promise<T> {
    const auth: Record<string, string> =
      input.proof === false
        ? { access_token: token }
        : { access_token: token, appsecret_proof: makeProof(token) };
    const timeout = opts.timeoutMs ?? (opts.file ? UPLOAD_TIMEOUT_MS : undefined);
    const fields = { ...(params as Record<string, string>), ...auth };
    const res = await input.http.request<T>(
      method !== 'POST'
        ? {
            method,
            url: fullUrl,
            query: { ...params, ...auth },
            ...(timeout ? { timeoutMs: timeout } : {}),
          }
        : {
            method,
            url: fullUrl,
            ...(opts.file ? { multipart: multipart(fields, opts.file) } : { form: fields }),
            ...(timeout ? { timeoutMs: timeout } : {}),
          },
    );
    if (res.ok) return res.body;
    const c = classifyGraphError(res.status, res.body);
    throw new ProviderError({
      ...c,
      status: res.status,
      retryAfterSec: retryAfterSec(res.headers),
    });
  }

  return {
    get: (path, token, query = {}) => call('GET', url(base, path), token, query),
    post: (path, token, form, opts = {}) =>
      call('POST', url(opts.video ? videoBase : base, path), token, form, opts),
    async postBytes<T>(
      fullUrl: string,
      token: string,
      bytes: Uint8Array,
      headers: Record<string, string>,
    ) {
      const res = await input.http.request<T>({
        method: 'POST',
        url: fullUrl,
        bytes,
        headers: { authorization: `OAuth ${token}`, ...headers },
        timeoutMs: UPLOAD_TIMEOUT_MS,
      });
      if (res.ok) return res.body;
      const c = classifyGraphError(res.status, res.body);
      throw new ProviderError({
        ...c,
        status: res.status,
        retryAfterSec: retryAfterSec(res.headers),
      });
    },
    version,
    http: input.http,
    async delete(path, token) {
      await call('DELETE', url(base, path), token, {});
    },
    async getAll<T>(
      path: string,
      token: string,
      query: Record<string, string | number> = {},
      maxPages = 20,
    ) {
      const items: T[] = [];
      let next: string | undefined = url(base, path);
      let params = query;
      for (let i = 0; next && i < maxPages; i++) {
        const page: { data?: T[]; paging?: { next?: string } } = await call(
          'GET',
          next,
          token,
          params,
        );
        items.push(...(page.data ?? []));
        // `next` already carries the query (including the token); `call` adds the token back.
        next = page.paging?.next ? sameHost(stripAuth(page.paging.next), base) : undefined;
        params = {};
      }
      return items;
    },
  };
}

/**
 * A paging URL is followed only on the API's own host: the token goes with it, so an answer
 * pointing elsewhere (a tampered response, a misbehaving proxy) must not receive it.
 */
function sameHost(next: string, base: string): string {
  if (new URL(next).origin !== new URL(base).origin) {
    throw new ProviderError({
      kind: 'retryable',
      message: 'Meta answered with a paging link to another host',
    });
  }
  return next;
}

/** Removes access_token and appsecret_proof from a paging URL; `call` adds them back. */
function stripAuth(raw: string): string {
  const u = new URL(raw);
  u.searchParams.delete('access_token');
  u.searchParams.delete('appsecret_proof');
  return u.toString();
}
