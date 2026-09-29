import type { PublishErrorKind } from '@socioboard/contracts';

/**
 * The only error adapters throw (docs/backend/modules/providers.md). The publishing worker
 * decides from `kind` alone: `retryable` and `rate_limited` are retried (after `retryAfterSec`
 * when the network says), `auth` marks the account for reconnecting, `content` fails the target
 * with `message` shown to the user.
 */
export class ProviderError extends Error {
  readonly kind: PublishErrorKind;
  /** The network's own error code (e.g. Meta "190" or "190/463"), when it gave one. */
  readonly networkCode: string | null;
  readonly retryAfterSec: number | null;
  /** HTTP status of the failed call, or null when the request never got an answer. */
  readonly status: number | null;

  constructor(input: {
    kind: PublishErrorKind;
    message: string;
    networkCode?: string | null;
    retryAfterSec?: number | null;
    status?: number | null;
    cause?: unknown;
  }) {
    super(input.message, input.cause === undefined ? undefined : { cause: input.cause });
    this.name = 'ProviderError';
    this.kind = input.kind;
    this.networkCode = input.networkCode ?? null;
    this.retryAfterSec = input.retryAfterSec ?? null;
    this.status = input.status ?? null;
  }
}

export function isProviderError(err: unknown): err is ProviderError {
  return err instanceof ProviderError;
}

/**
 * The usual reading of an HTTP status when the network's body says nothing more specific:
 * 401 → auth, 429 → rate_limited, other 4xx → content, 5xx → retryable.
 */
export function kindFromStatus(status: number): PublishErrorKind {
  if (status === 401) return 'auth';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'retryable';
  return 'content';
}
