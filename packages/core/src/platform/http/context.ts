import type { Role } from '@socioboard/contracts';

/** Who is calling, resolved once per request by the session middleware. */
export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    isPlatformAdmin: boolean;
  };
  session: { id: string; activeWorkspaceId: string | null };
}

/** The caller's membership in the `:workspaceId` of the current route. */
export interface MemberContext {
  workspaceId: string;
  memberId: string;
  role: Role;
}

/**
 * Reads the session from request headers (cookie); `auth` is null when signed out. Provided by
 * auth. `setCookies` carries a refreshed session cookie when the session was extended; the
 * session middleware forwards it, or active users would be signed out when the old one expires.
 */
export type SessionResolver = (
  headers: Headers,
) => Promise<{ auth: AuthContext | null; setCookies: string[] }>;

/** Membership of a user in a live (not deleted) workspace. Provided by workspaces. */
export type MembershipLookup = (
  userId: string,
  workspaceId: string,
) => Promise<MemberContext | null>;

declare global {
  // Express keeps per-request state on res.locals; these are the fields our middleware sets.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      requestId?: string;
      auth?: AuthContext | null;
      member?: MemberContext;
    }
  }
}
