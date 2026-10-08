import { approvalRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { ApprovalService } from './service';

/** Mounts the review routes (contracts: approvalRoutes; comments arrive with P4-B3). */
export function registerApprovalRoutes(api: ApiRouter, approvals: ApprovalService) {
  api.route(r.submitPost, ({ auth, member, params, body }) =>
    approvals.submit(auth, member, params.postId, body.note),
  );
  api.route(r.approvePost, ({ auth, member, params, body }) =>
    approvals.approve(auth, member, params.postId, body),
  );
  api.route(r.requestChanges, ({ auth, member, params, body }) =>
    approvals.requestChanges(auth, member, params.postId, body.note),
  );
  api.route(r.withdrawPost, ({ auth, member, params }) =>
    approvals.withdraw(auth, member, params.postId),
  );
  api.route(r.listPostReview, async ({ member, params }) => ({
    items: await approvals.history(member, params.postId),
  }));
  api.route(r.listReviews, ({ member, query }) => approvals.list(member, query));
}
