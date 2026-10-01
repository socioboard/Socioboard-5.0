// The social-accounts, posts and publishing services, wired together once for both processes:
// the API queues publish jobs and the worker runs them, with the same code on each side.
import type { Registry } from '@socioboard/providers';

import { createMediaUrlSigner, type MediaUrlSigner } from './modules/media';
import {
  createPostService,
  registerPostListeners,
  type PostService,
  type ScheduledJob,
} from './modules/posts';
import {
  publishJobId,
  publishQueue,
  scheduledJobId,
  type PublishJobData,
} from './modules/publishing';
import {
  createCalendarEntries,
  createQueueSlotService,
  createReconciler,
  createRecurrenceService,
  createSchedulingService,
  type QueueSlotService,
  type Reconciler,
  type RecurrenceService,
  type SchedulingService,
} from './modules/scheduling';
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
  scheduling: SchedulingService;
  queueSlots: QueueSlotService;
  recurrence: RecurrenceService;
  /** Rebuilds lost publish jobs and stops stuck deliveries (the `reconcile` job). */
  reconciler: Reconciler;
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
    rateLimiter: platform.rateLimiter,
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
    enqueueScheduled,
    dropScheduledJobs,
    // Bound late: the recurrence service is created below, with the posts service.
    recurrenceOf: (workspaceId, postId) => recurrence.get(workspaceId, postId),
  });
  registerPostListeners(events, posts, logger);
  const scheduling = createSchedulingService({
    db,
    clock,
    events,
    posts,
    enqueueScheduled,
    dropScheduledJobs,
  });

  /** A delayed job per scheduled target, named and keyed by its schedule version. */
  async function enqueueScheduled(jobs: ScheduledJob[]) {
    const now = clock.now().getTime();
    await platform.queues.get(queue).addBulk(
      jobs.map((j) => ({
        name: 'publish',
        data: { workspaceId: j.workspaceId, targetId: j.targetId, scheduleVersion: j.version },
        opts: {
          jobId: scheduledJobId(j.targetId, j.version),
          delay: Math.max(0, j.at.getTime() - now),
        },
      })),
    );
  }

  /** Best effort: a job that is running or already gone stays; an older version does nothing. */
  async function dropScheduledJobs(jobs: { targetId: string; version: number }[]) {
    const q = platform.queues.get(queue);
    await Promise.all(
      jobs.map((j) =>
        q.remove(scheduledJobId(j.targetId, j.version)).catch((err: unknown) => {
          logger.warn({ err, targetId: j.targetId }, 'could not drop an old scheduled job');
        }),
      ),
    );
  }

  const queueSlots = createQueueSlotService({
    db,
    clock,
    events,
    entries: createCalendarEntries(db, storage),
  });

  const recurrence = createRecurrenceService({
    db,
    clock,
    logger,
    events,
    posts,
    enqueueScheduled,
    dropScheduledJobs,
  });
  recurrence.registerListeners();
  const reconciler = createReconciler({
    db,
    clock,
    logger,
    events,
    jobState: (jobId) => platform.queues.get(queue).getJobState(jobId),
    removeJob: async (jobId) => {
      await platform.queues.get(queue).remove(jobId);
    },
    enqueueScheduled,
    recomputeStatus: posts.recomputeStatus,
  });

  return {
    registry,
    socialAccounts,
    posts,
    scheduling,
    queueSlots,
    recurrence,
    reconciler,
    mediaUrls,
    publishQueue: queue,
  };
}
