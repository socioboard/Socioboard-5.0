import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';

import { routeAfterSignIn, safeRedirect } from './redirect';
import { authOptionsQuery, meQuery } from './session';

/**
 * `?redirect=` kept only when it is a safe in-app path. The key is always returned (undefined when
 * unsafe): the router merges validated params over the raw ones, so leaving it out would let the
 * raw value through.
 */
export function redirectSearch(search: Record<string, unknown>): { redirect?: string | undefined } {
  return { redirect: safeRedirect(search.redirect) };
}

/** A short string search param (error codes, tokens), or nothing. */
export function stringParam(value: unknown, max = 500): string | undefined {
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : undefined;
}

/** Sign-in and sign-up pages: someone already signed in goes where they were heading. */
export async function redirectIfSignedIn(queryClient: QueryClient, target?: string) {
  const me = await queryClient.query({ ...meQuery, staleTime: 'static' });
  if (!me) return;
  const options = await queryClient.query({ ...authOptionsQuery, staleTime: 'static' });
  throw redirect({ href: target ?? routeAfterSignIn(me, options), replace: true });
}

/** Pages that need a session: signed-out visitors go to sign in and come back afterwards. */
export async function requireSignedIn(queryClient: QueryClient, here: string) {
  const me = await queryClient.query({ ...meQuery, staleTime: 'static' });
  if (!me) throw redirect({ to: '/login', search: { redirect: here }, replace: true });
  return me;
}
