import { ROLES, type Role } from '@socioboard/contracts';

import type { Db, MembershipLookup } from '../../platform';

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value);

/** Roles that manage accounts, and so always have every one of them. */
const ALL_ACCOUNTS: readonly Role[] = ['owner', 'admin'];

/**
 * The caller's membership in a live workspace (soft-deleted workspaces have no members as far as
 * the API is concerned). An unknown role in the database fails closed: no membership. A member
 * limited to some accounts gets their ids (P4-B4), read on every request so a change applies at
 * once.
 */
export function createMembershipLookup(db: Db): MembershipLookup {
  return async (userId, workspaceId) => {
    const member = await db.client.member.findFirst({
      where: { userId, workspaceId, workspace: { deletedAt: null } },
      select: {
        id: true,
        role: true,
        accountsLimited: true,
        accountAccess: { select: { socialAccountId: true } },
      },
    });
    if (!member || !isRole(member.role)) return null;
    const limited = member.accountsLimited && !ALL_ACCOUNTS.includes(member.role);
    return {
      workspaceId,
      memberId: member.id,
      role: member.role,
      accountIds: limited ? member.accountAccess.map((a) => a.socialAccountId) : null,
    };
  };
}
