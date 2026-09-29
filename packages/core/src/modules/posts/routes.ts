import { postRoutes as r } from '@socioboard/contracts';

import { typedEvents, type ApiRouter, type EventBus, type Logger } from '../../platform';
import type { SocialAccountEvents } from '../social-accounts';
import type { PostService } from './service';

/** Mounts the post routes (contracts: postRoutes); publish-now and retry arrive with P1-B7. */
export function registerPostRoutes(api: ApiRouter, posts: PostService) {
  api.route(r.validatePost, ({ member, body }) => posts.validate(member, body));
  api.route(r.createPost, ({ auth, member, body }) => posts.createDraft(auth, member, body));
  api.route(r.listPosts, ({ member, query }) => posts.list(member, query));
  api.route(r.getPost, ({ member, params }) => posts.get(member, params.postId));
  api.route(r.updatePost, ({ auth, member, params, body }) =>
    posts.update(auth, member, params.postId, body),
  );
  api.route(r.deletePost, ({ auth, member, params }) => posts.remove(auth, member, params.postId));
  api.route(r.duplicatePost, ({ auth, member, params }) =>
    posts.duplicate(auth, member, params.postId),
  );
}

/** Keeps post status right when accounts are disconnected (their targets were cancelled). */
export function registerPostListeners(
  bus: EventBus<Record<string, unknown>>,
  posts: PostService,
  logger: Logger,
) {
  typedEvents<SocialAccountEvents>(bus).on('account.disconnected', async (p) => {
    try {
      await posts.recomputeForTargets(p.workspaceId, p.cancelledTargetIds);
    } catch (err) {
      logger.error({ err, accountId: p.accountId }, 'recomputing post status failed');
    }
  });
}
