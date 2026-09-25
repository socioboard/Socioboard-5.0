import { ROLES, type Role } from '@socioboard/contracts';

import type { Db, MembershipLookup } from '../../platform';

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value);

/**
 * The caller's membership in a live workspace (soft-deleted workspaces have no members as far as
 * the API is concerned). An unknown role in the database fails closed: no membership.
 */
export function createMembershipLookup(db: Db): MembershipLookup {
  return async (userId, workspaceId) => {
    const member = await db.client.member.findFirst({
      where: { userId, workspaceId, workspace: { deletedAt: null } },
      select: { id: true, role: true },
    });
    if (!member || !isRole(member.role)) return null;
    return { workspaceId, memberId: member.id, role: member.role };
  };
}
