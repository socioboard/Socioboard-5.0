/**
 * Prisma models that carry a `workspaceId` column. Queries on these through
 * `db.forWorkspace(id)` are always limited to that workspace. Every new workspace-owned model
 * must be added here; a test compares this list with the schema.
 *
 * Workspace itself is not listed: it is the tenant, and its own id is the workspace id.
 */
export const WORKSPACE_SCOPED_MODELS: readonly string[] = [
  'Member',
  'Invitation',
  'MediaFolder',
  'MediaAsset',
  'AuditLog',
  'SocialConnection',
  'SocialAccount',
  'SocialAccountGroup',
  'SocialAccountGroupItem',
  'OAuthState',
  'Post',
  'PostTarget',
  'PublishAttempt',
  'PostLabel',
  'RecurringRule',
  'QueueSlot',
  'MemberAccountAccess',
  'PostApproval',
  'PostComment',
  'Task',
  'AiJob',
  // Read through the user (a feed spans workspaces); scoped only when written for a workspace.
  'Notification',
];
