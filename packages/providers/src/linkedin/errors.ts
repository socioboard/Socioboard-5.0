import { kindFromStatus, ProviderError } from '../errors';
import { retryAfterSec, type HttpResponse } from '../http';

/** A LinkedIn error answer: the REST APIs' `message`/`serviceErrorCode`, or OAuth's `error`. */
interface LinkedInErrorBody {
  message?: string;
  serviceErrorCode?: number;
  code?: string;
  status?: number;
  error?: string;
  error_description?: string;
}

const first = (...values: (string | undefined)[]) =>
  values.find((v) => typeof v === 'string' && v.trim() !== '');

/**
 * Reads a failed LinkedIn answer into a ProviderError (learn.microsoft.com/linkedin, error
 * handling and rate limits, checked 2026-10-08). Every LinkedIn call in this folder ends here,
 * and the publishing worker acts on `kind` alone:
 * - 401 and OAuth's `invalid_grant`/`invalid_token` → sign in again (expired, revoked, bad token).
 * - 429 → rate limited. LinkedIn's daily limits reset at midnight UTC, but a 429 can also be a
 *   short "infrastructure protection" one, and a scheduled post can't wait that long anyway
 *   (publishing's MAX_LATE_MINUTES); so wait what Retry-After says, else the worker's backoff.
 *   Except LinkedIn's cap on posts by members who haven't verified their identity ("share limit
 *   has been reached for unverified members", seen live 2026-10-08): retrying in minutes can't
 *   help, so the post fails at once and says what to do.
 * - 426 → LinkedIn retired the API version we send (`LinkedIn-Version`): no retry helps, the
 *   adapter needs a newer version; worded so whoever runs the server knows.
 * - Other 4xx (403 missing permission or not a page admin, 422 duplicate post) → the content
 *   fails with LinkedIn's own words; 5xx → try again.
 */
export function linkedinError(res: HttpResponse, action: string): ProviderError {
  const body = (
    typeof res.body === 'object' && res.body !== null ? res.body : {}
  ) as LinkedInErrorBody;
  const said = first(body.message, body.error_description, body.error);
  const message = said
    ? `LinkedIn: ${said}`
    : `LinkedIn ${action} failed (HTTP ${String(res.status)})`;
  const code =
    body.code ??
    body.error ??
    (body.serviceErrorCode === undefined ? null : String(body.serviceErrorCode));

  if (res.status === 401 || body.error === 'invalid_grant' || body.error === 'invalid_token') {
    return new ProviderError({ kind: 'auth', message, status: res.status, networkCode: code });
  }
  if (said && /share limit has been reached for unverified members/i.test(said)) {
    return new ProviderError({
      kind: 'content',
      message:
        "LinkedIn limits how many posts members who haven't verified their identity can share. Verify the account on LinkedIn, or try again tomorrow.",
      status: res.status,
      networkCode: code,
    });
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
  if (res.status === 426) {
    return new ProviderError({
      kind: 'content',
      message: `${message}. LinkedIn no longer accepts the API version Socioboard sends; Socioboard needs an update.`,
      status: 426,
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
