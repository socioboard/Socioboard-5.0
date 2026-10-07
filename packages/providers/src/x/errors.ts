import { kindFromStatus, ProviderError } from '../errors';
import { retryAfterSec, type HttpResponse } from '../http';

/** An X API error answer: v2 problem details, an `errors` array, or OAuth's `error`. */
interface XErrorBody {
  title?: string;
  detail?: string;
  type?: string;
  status?: number;
  error?: string;
  error_description?: string;
  errors?: { message?: string; detail?: string; title?: string; code?: number }[];
}

const first = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === 'string' && v.trim() !== '');

/**
 * Reads a failed X answer into a ProviderError (docs.x.com, checked 2026-10-06): 401 and OAuth's
 * `invalid_grant`/`invalid_token` → sign in again; 429 → rate limited until `x-rate-limit-reset`;
 * 402 → the app's credits ran out (pay per use), held back app-wide for an hour; other 4xx (a
 * duplicate post, media X refuses) → the content; 5xx → try again.
 */
export function xError(res: HttpResponse, action: string): ProviderError {
  const body = (typeof res.body === 'object' && res.body !== null ? res.body : {}) as XErrorBody;
  const said = first(
    body.detail,
    body.errors?.[0]?.message,
    body.errors?.[0]?.detail,
    body.error_description,
    body.title,
    body.error,
  );
  const message = said ? `X: ${said}` : `X ${action} failed (HTTP ${String(res.status)})`;
  const code =
    body.type ?? body.error ?? (body.errors?.[0]?.code ? String(body.errors[0].code) : null);

  if (res.status === 401 || body.error === 'invalid_grant' || body.error === 'invalid_token') {
    return new ProviderError({ kind: 'auth', message, status: res.status, networkCode: code });
  }
  if (res.status === 429) {
    const reset = Number(res.headers.get('x-rate-limit-reset'));
    const wait =
      Number.isFinite(reset) && reset > 0
        ? Math.max(1, Math.ceil(reset - Date.now() / 1000))
        : retryAfterSec(res.headers);
    return new ProviderError({
      kind: 'rate_limited',
      message,
      status: 429,
      networkCode: code,
      retryAfterSec: wait,
    });
  }
  if (res.status === 402) {
    return new ProviderError({
      kind: 'rate_limited',
      message: `${message}. The X app's credits are used up; top them up in the X developer console.`,
      status: 402,
      networkCode: code,
      retryAfterSec: 3600,
      limitScope: 'app',
    });
  }
  return new ProviderError({
    kind: kindFromStatus(res.status),
    message,
    status: res.status,
    networkCode: code,
  });
}
