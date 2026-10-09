import { kindFromStatus, ProviderError } from '../errors';
import { retryAfterSec, type HttpResponse } from '../http';

/** A Google/YouTube API error response or OAuth error answer. */
interface YouTubeErrorBody {
  error?:
    | string
    | {
        code?: number;
        message?: string;
        status?: string;
        errors?: {
          message?: string;
          domain?: string;
          reason?: string;
          location?: string;
          locationType?: string;
        }[];
      };
  error_description?: string;
}

const first = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === 'string' && v.trim() !== '');

/**
 * Reads a failed YouTube / Google API response into a ProviderError.
 * 401 / authError / UNAUTHENTICATED -> auth (sign in again)
 * 403 quotaExceeded / rateLimitExceeded / RESOURCE_EXHAUSTED -> rate_limited
 * 400 / content violations -> content
 * 5xx / backendError -> retryable
 */
export function youtubeError(res: HttpResponse, action: string): ProviderError {
  const body = (
    typeof res.body === 'object' && res.body !== null ? res.body : {}
  ) as YouTubeErrorBody;

  let errorObj:
    | { message?: string; status?: string; errors?: { reason?: string; message?: string }[] }
    | undefined;
  let oauthError: string | undefined;

  if (typeof body.error === 'object') {
    errorObj = body.error;
  } else if (typeof body.error === 'string') {
    oauthError = body.error;
  }

  const primaryReason = errorObj?.errors?.[0]?.reason;
  const primaryMessage = errorObj?.errors?.[0]?.message;

  const said = first(primaryMessage, errorObj?.message, body.error_description, oauthError);

  const message = said
    ? `YouTube: ${said}`
    : `YouTube ${action} failed (HTTP ${String(res.status)})`;
  const code = primaryReason ?? errorObj?.status ?? oauthError ?? null;

  // 1. Auth errors
  if (
    res.status === 401 ||
    oauthError === 'invalid_grant' ||
    oauthError === 'invalid_token' ||
    primaryReason === 'authError' ||
    errorObj?.status === 'UNAUTHENTICATED'
  ) {
    return new ProviderError({ kind: 'auth', message, status: res.status, networkCode: code });
  }

  // 2. Rate limit / Quota errors
  if (
    res.status === 429 ||
    primaryReason === 'quotaExceeded' ||
    primaryReason === 'rateLimitExceeded' ||
    primaryReason === 'userRateLimitExceeded' ||
    errorObj?.status === 'RESOURCE_EXHAUSTED'
  ) {
    const wait = retryAfterSec(res.headers);
    return new ProviderError({
      kind: 'rate_limited',
      message,
      status: res.status,
      networkCode: code,
      retryAfterSec: wait !== null && wait > 0 ? wait : 3600,
    });
  }

  // 3. Content errors
  if (
    res.status === 400 ||
    primaryReason === 'invalidVideoTitle' ||
    primaryReason === 'videoTitleTooLong' ||
    primaryReason === 'uploadLimitExceeded' ||
    primaryReason === 'tagsTooLong' ||
    errorObj?.status === 'INVALID_ARGUMENT'
  ) {
    return new ProviderError({
      kind: 'content',
      message,
      status: res.status,
      networkCode: code,
    });
  }

  // 4. Retryable server errors
  if (res.status >= 500 || primaryReason === 'backendError') {
    return new ProviderError({
      kind: 'retryable',
      message,
      status: res.status,
      networkCode: code,
    });
  }

  return new ProviderError({
    kind: kindFromStatus(res.status),
    message,
    status: res.status,
    networkCode: code,
  });
}
