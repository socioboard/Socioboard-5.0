/** Events the workspaces module emits (docs/backend/modules/workspaces.md); audit listens. */
export interface WorkspaceEvents extends Record<string, unknown> {
  'workspace.created': { workspaceId: string; userId: string };
  'workspace.updated': { workspaceId: string; userId: string; fields: string[] };
  'workspace.deleted': { workspaceId: string; userId: string };
  'workspace.ownership_transferred': { workspaceId: string; fromUserId: string; toUserId: string };
  'member.invited': {
    workspaceId: string;
    invitationId: string;
    email: string;
    role: string;
    userId: string;
  };
  'member.joined': { workspaceId: string; userId: string; role: string; invitationId: string };
  'member.role_changed': {
    workspaceId: string;
    memberId: string;
    from: string;
    to: string;
    userId: string;
  };
  'member.removed': {
    workspaceId: string;
    memberId: string;
    removedUserId: string;
    userId: string;
  };
  'invitation.revoked': { workspaceId: string; invitationId: string; userId: string };
  'invitation.declined': { workspaceId: string; invitationId: string; userId: string };
}
