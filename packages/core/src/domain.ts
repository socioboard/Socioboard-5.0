// The social-accounts, posts and publishing services, wired together once for both processes:
// the API queues publish jobs and the worker runs them, with the same code on each side.
import type { Registry } from '@socioboard/providers';

import { createMediaUrlSigner, type MediaUrlSigner } from './modules/media';
import { createPostService, registerPostListeners, type PostService } from './modules/posts';
import { publishJobId, publishQueue, type PublishJobData } from './modules/publishing';
import {
  createNetworkRegistry,
  createSocialAccountService,
  type SocialAccountService,
} from './modules/social-accounts';
import { createMembershipLookup } from './modules/workspaces';
import type { Platform, QueueDefinition } from './platform';

export interface PublishingServices {
  registry: Registry;
  socialAccounts: SocialAccountService;
  posts: PostService;
  /** Signed public media addresses (served by the API at /public-media). */
  mediaUrls: MediaUrlSigner;
  /** The `publish` queue: the API adds to it, the worker processes it. */
  publishQueue: QueueDefinition<PublishJobData, void>;
}

export function createPublishingServices(
  platform: Platform,
  options: { registry?: Registry | undefined } = {},
): PublishingServices {
  const { db, storage, clock, logger, events, config } = platform;
  const registry = options.registry ?? createNetworkRegistry(config, logger);
  const socialAccounts = createSocialAccountService({
    db,
    crypto: platform.crypto,
    clock,
    logger,
    events,
    registry,
    appUrl: config.appUrl,
    lookupMembership: createMembershipLookup(db),
  });

  const mediaUrls = createMediaUrlSigner({
    baseUrl: config.media.publicUrl,
    secret: config.auth.secret,
    storagePublicUrl: config.media.storagePublicUrl,
  });
  if (!config.media.publicUrl && config.media.storagePublicUrl) {
    logger.warn(
      'STORAGE_PUBLIC_URL: media is readable by anyone with its path; keep storage private in production',
    );
  }
  const queue = publishQueue({
    db,
    storage,
    mediaUrls,
    clock,
    logger,
    events,
    registry,
    getCredentials: socialAccounts.getCredentials,
    markReauthRequired: socialAccounts.markReauthRequired,
    recomputeStatus: (workspaceId, postId) => posts.recomputeStatus(workspaceId, postId),
  });

  const posts = createPostService({
    db,
    storage,
    events,
    registry,
    kv: platform.kv,
    async enqueuePublish(jobs) {
      await platform.queues.get(queue).addBulk(
        jobs.map((j) => ({
          name: 'publish',
          data: { workspaceId: j.workspaceId, targetId: j.targetId },
          opts: { jobId: publishJobId(j.targetId, j.tries) },
        })),
      );
    },
  });
  registerPostListeners(events, posts, logger);

  return { registry, socialAccounts, posts, mediaUrls, publishQueue: queue };
}
