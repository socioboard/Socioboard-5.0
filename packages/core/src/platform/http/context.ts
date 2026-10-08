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
  /**
   * The social accounts they may see and post to (P4-B4), or null for every account in the
   * workspace. Owners and admins always have every account.
   */
  accountIds: readonly string[] | null;
}

/** Whether the member may see and post to this social account. */
export function canUseAccount(member: MemberContext, accountId: string): boolean {
  return member.accountIds === null || member.accountIds.includes(accountId);
}

/**
 * A Prisma `where` part keeping rows whose `key` is one of the member's accounts, to spread into
 * a filter: `{ ...onlyMemberAccounts(member, 'socialAccountId') }`. Empty when they have all.
 */
export function onlyMemberAccounts<K extends string>(
  member: MemberContext,
  key: K,
): Partial<Record<K, { in: string[] }>> {
  if (member.accountIds === null) return {};
  return { [key]: { in: [...member.accountIds] } } as Partial<Record<K, { in: string[] }>>;
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
