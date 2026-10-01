import { adminRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { AdminService } from './service';

/**
 * Mounts the admin console's routes (contracts: adminRoutes). The router only mounts them with a
 * platform-admin guard, which runs before anything else (route.ts).
 */
export function registerAdminRoutes(api: ApiRouter, admin: AdminService) {
  api.route(r.getAdminOverview, () => admin.overview());
  api.route(r.getPublishingHealth, ({ query }) => admin.publishingHealth(query));
  api.route(r.listProblemTargets, ({ query }) => admin.listProblemTargets(query));
  api.route(r.adminRetryTarget, ({ auth, params, body }) =>
    admin.retryTarget(auth, params.targetId, body.reason),
  );
  api.route(r.adminCancelTarget, ({ auth, params, body }) =>
    admin.cancelTarget(auth, params.targetId, body.reason),
  );
  api.route(r.listAttentionAccounts, ({ query }) => admin.listAttentionAccounts(query));
}
