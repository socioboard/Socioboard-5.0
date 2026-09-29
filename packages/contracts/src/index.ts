// @socioboard/contracts: what the API accepts and returns, shared by api and web.
// No imports from other workspace packages (enforced by dependency-cruiser).
export * from './common';
export * from './openapi';
export * from './fields';
export * from './permissions';
export * from './route';

export * from './auth';
export * from './media';
export * from './networks';
export * from './posts';
export * from './social-accounts';
export * from './workspaces';

import { authRoutes } from './auth';
import { mediaRoutes } from './media';
import { networkRoutes } from './networks';
import { postRoutes } from './posts';
import { socialAccountRoutes } from './social-accounts';
import { workspaceRoutes } from './workspaces';

/** Every route the API serves under /api/v1, by module. The API must implement all of them. */
export const apiRoutes = {
  auth: authRoutes,
  workspaces: workspaceRoutes,
  media: mediaRoutes,
  networks: networkRoutes,
  socialAccounts: socialAccountRoutes,
  posts: postRoutes,
};
