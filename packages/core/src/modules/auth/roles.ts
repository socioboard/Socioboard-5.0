import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

/**
 * Better Auth's own checks for its organization operations (update/delete workspace, manage
 * members and invitations), which our /api/v1 routes call server-side. They mirror the
 * workspace-level permissions in @socioboard/contracts:
 *   workspace:delete → owner;  workspace:update, members:manage → owner, admin.
 * Everything else (posts, media, …) is checked by our own requirePermission middleware.
 */
export const workspaceAc = createAccessControl(defaultStatements);

export const workspaceRoles = {
  owner: workspaceAc.newRole(ownerAc.statements),
  admin: workspaceAc.newRole(adminAc.statements),
  editor: workspaceAc.newRole(memberAc.statements),
  contributor: workspaceAc.newRole(memberAc.statements),
  viewer: workspaceAc.newRole(memberAc.statements),
};
