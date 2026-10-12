import { approvalRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { CommentService } from './comments';
import type { ApprovalService } from './service';

/** Mounts the review and comment routes (contracts: approvalRoutes). */
export function registerApprovalRoutes(
  api: ApiRouter,
  approvals: ApprovalService,
  comments: CommentService,
) {
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

  api.route(r.listComments, async ({ member, params }) => ({
    items: await comments.list(member, params.postId),
  }));
  api.route(r.listMentionable, async ({ member, params }) => ({
    items: await comments.mentionable(member, params.postId),
  }));
  api.route(r.createComment, ({ auth, member, params, body }) =>
    comments.create(auth, member, params.postId, body),
  );
  api.route(r.updateComment, ({ auth, member, params, body }) =>
    comments.update(auth, member, params.commentId, body),
  );
  api.route(r.deleteComment, ({ auth, member, params }) =>
    comments.remove(auth, member, params.commentId),
  );
}
