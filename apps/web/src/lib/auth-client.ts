// Better Auth's client for /api/auth/* (sign-up, sign-in, magic link, reset, 2FA). Everything else
// goes through the typed API client in api.ts.
import { magicLinkClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { ApiError } from './api';

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [twoFactorClient(), magicLinkClient()],
  // Looked up per call, not captured once, so anything that wraps fetch later still applies.
  fetchOptions: { customFetchImpl: (input, init) => globalThis.fetch(input, init) },
});

interface AuthClientError {
  code?: string | undefined;
  message?: string | undefined;
  status: number;
}

/**
 * Better Auth's client returns `{ data, error }` instead of throwing. This turns an error into the
 * same ApiError the rest of the app uses, so errorMessage() translates it.
 */
export function unwrap<T>(
  result: { data: T; error: null } | { data: null; error: AuthClientError },
): T {
  if (result.error) {
    const { status, code, message } = result.error;
    const resolved = code ?? (status === 429 ? 'RATE_LIMITED' : `HTTP_${String(status)}`);
    throw new ApiError(status, resolved, message ?? '', undefined);
  }
  return result.data;
}
