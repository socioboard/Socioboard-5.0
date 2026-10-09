import { kindFromStatus, ProviderError } from '../errors';
import { retryAfterSec, type HttpResponse } from '../http';

interface TumblrErrorBody {
  meta?: { status?: number; msg?: string };
  errors?: { title?: string; code?: number; detail?: string; message?: string }[];
  error?: string;
  error_description?: string;
}

const first = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === 'string' && v.trim() !== '');

/**
 * Reads a failed Tumblr answer into a ProviderError:
 * - 401 / invalid_grant / invalid_token -> auth (sign in again)
 * - 429 -> rate limited
 * - 400 / 422 -> content rejection (invalid NPF block, bad parameters, media format)
 * - 5xx -> retryable server error
 */
export function tumblrError(res: HttpResponse, action: string): ProviderError {
  const body = (
    typeof res.body === 'object' && res.body !== null ? res.body : {}
  ) as TumblrErrorBody;
  const said = first(
    body.errors?.[0]?.detail,
    body.errors?.[0]?.message,
    body.errors?.[0]?.title,
    body.error_description,
    body.error,
    body.meta?.msg,
  );
  const message = said ? `Tumblr: ${said}` : `Tumblr ${action} failed (HTTP ${String(res.status)})`;
  const code =
    body.error ??
    (body.errors?.[0]?.code !== undefined
      ? String(body.errors[0].code)
      : (body.errors?.[0]?.title ?? (body.meta?.status ? String(body.meta.status) : null)));

  if (res.status === 401 || body.error === 'invalid_grant' || body.error === 'invalid_token') {
    return new ProviderError({ kind: 'auth', message, status: res.status, networkCode: code });
  }

  if (res.status === 429) {
    const wait = retryAfterSec(res.headers) ?? 60;
    return new ProviderError({
      kind: 'rate_limited',
      message,
      status: 429,
      networkCode: code,
      retryAfterSec: wait,
    });
  }

  return new ProviderError({
    kind: kindFromStatus(res.status),
    message,
    status: res.status,
    networkCode: code,
  });
}
