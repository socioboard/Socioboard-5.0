// Public surface of the workspaces module (docs/backend/modules/workspaces.md).
export { createMembershipLookup } from './membership';
export type { WorkspaceEvents } from './events';
export { purgeDeletedWorkspaces, workspacePurgeQueue } from './jobs';
export { registerWorkspaceRoutes } from './routes';
export {
  createWorkspaceService,
  maskEmail,
  slugify,
  type WorkspaceAuthPort,
  type WorkspaceService,
} from './service';
