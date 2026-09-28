import type { AuthOptions, Me } from '@socioboard/contracts';

/**
 * A `?redirect=` value we are willing to follow: a path inside this app. Anything else (other
 * sites, protocol-relative "//evil.test", "javascript:" and friends) is dropped, so a crafted link
 * can't send someone elsewhere after they sign in.
 */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2000) return undefined;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return undefined;
  try {
    const url = new URL(value, 'https://app.invalid');
    if (url.origin !== 'https://app.invalid') return undefined;
    return url.pathname + url.search + url.hash;
  } catch {
    return undefined;
  }
}

/**
 * Where someone lands after signing in (docs/frontend/areas/auth-onboarding.md): verify the email
 * first when this server requires it and they have no workspace to go to; no workspace → create
 * one; otherwise the active workspace, else the first.
 */
export function routeAfterSignIn(
  me: Me,
  options?: Pick<AuthOptions, 'emailVerificationRequired'>,
): string {
  if (me.memberships.length === 0) {
    return options?.emailVerificationRequired && !me.user.emailVerified
      ? '/verify-email'
      : '/onboarding';
  }
  const active = me.memberships.find((m) => m.workspace.id === me.activeWorkspaceId);
  const target = active ?? me.memberships[0];
  return `/w/${encodeURIComponent(target?.workspace.slug ?? '')}`;
}
