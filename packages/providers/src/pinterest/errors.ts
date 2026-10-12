import { kindFromStatus, ProviderError } from '../errors';
import { retryAfterSec, type HttpResponse } from '../http';

/** A Pinterest error answer: the API's `{ code, message }`, or OAuth's `error`. */
interface PinterestErrorBody {
  code?: number;
  message?: string;
  error?: string;
  error_description?: string;
}

const first = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === 'string' && v.trim() !== '');

/**
 * Reads a failed Pinterest answer into a ProviderError (Pinterest's OpenAPI spec v5.28.0: every
 * error is `{ code, message }`; checked 2026-10-09). Every Pinterest call in this folder ends
 * here, and the publishing worker acts on `kind` alone:
 * - 401 and OAuth's `invalid_grant`/`invalid_token` → sign in again (expired, revoked, bad token).
 * - 429 → rate limited; wait what Retry-After says, else the worker's backoff. Pinterest also
 *   sends `x-ratelimit-reset`, but doesn't document its unit, so it isn't read.
 * - Other 4xx (a board that's gone, a missing permission, an image Pinterest refuses) → the
 *   content fails with Pinterest's own words; 5xx → try again.
 */
export function pinterestError(res: HttpResponse, action: string): ProviderError {
  const body = (
    typeof res.body === 'object' && res.body !== null ? res.body : {}
  ) as PinterestErrorBody;
  const said = first(body.message, body.error_description, body.error);
  const message = said
    ? `Pinterest: ${said}`
    : `Pinterest ${action} failed (HTTP ${String(res.status)})`;
  const code = body.code === undefined ? (body.error ?? null) : String(body.code);

  if (res.status === 401 || body.error === 'invalid_grant' || body.error === 'invalid_token') {
    return new ProviderError({ kind: 'auth', message, status: res.status, networkCode: code });
  }
  if (res.status === 429) {
    return new ProviderError({
      kind: 'rate_limited',
      message,
      status: 429,
      networkCode: code,
      retryAfterSec: retryAfterSec(res.headers),
    });
  }
  return new ProviderError({
    kind: kindFromStatus(res.status),
    message,
    status: res.status,
    networkCode: code,
  });
}
