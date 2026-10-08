// @socioboard/contracts: what the API accepts and returns, shared by api and web.
// No imports from other workspace packages (enforced by dependency-cruiser).
export * from './common';
export * from './openapi';
export * from './fields';
export * from './permissions';
export * from './route';
export * from './time';

export * from './admin';
export * from './ai';
export * from './approvals';
export * from './auth';
export * from './events';
export * from './media';
export * from './network-options';
export * from './networks';
export * from './notifications';
export * from './posts';
export * from './recurrence';
export * from './scheduling';
export * from './shortlinks';
export * from './social-accounts';
export * from './tasks';
export * from './telemetry';
export * from './workspaces';

import { adminRoutes } from './admin';
import { aiRoutes } from './ai';
import { approvalRoutes } from './approvals';
import { authRoutes } from './auth';
import { mediaRoutes } from './media';
import { networkRoutes } from './networks';
import { notificationRoutes } from './notifications';
import { postRoutes } from './posts';
import { schedulingRoutes } from './scheduling';
import { shortlinkRoutes } from './shortlinks';
import { socialAccountRoutes } from './social-accounts';
import { taskRoutes } from './tasks';
import { telemetryRoutes } from './telemetry';
import { workspaceRoutes } from './workspaces';

/**
 * Every route the API serves, by module: under /api/v1, and the admin console's under /api/admin.
 * The API must implement all of them.
 */
export const apiRoutes = {
  auth: authRoutes,
  workspaces: workspaceRoutes,
  media: mediaRoutes,
  networks: networkRoutes,
  socialAccounts: socialAccountRoutes,
  posts: postRoutes,
  scheduling: schedulingRoutes,
  notifications: notificationRoutes,
  shortlinks: shortlinkRoutes,
  approvals: approvalRoutes,
  tasks: taskRoutes,
  ai: aiRoutes,
  admin: adminRoutes,
  telemetry: telemetryRoutes,
};
