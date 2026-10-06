import { createBullBoard } from '@bull-board/api';
import { metrics } from '@opentelemetry/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { Router, type RequestHandler } from 'express';

import { defineQueue, type Queues } from '../../platform';

/**
 * Every queue the worker runs. The admin console counts their backlog and Bull Board shows them;
 * the worker checks at startup that it started exactly these, so a new queue can't be missed.
 */
export const WORKER_QUEUES = [
  'media-process',
  'publish',
  'recurring',
  'reconcile',
  'token-refresh',
  'account-health',
  'notifications',
  'notification-purge',
  'notification-digest',
  'workspace-purge',
  'media-purge',
  'audit-purge',
] as const;

/** Producer handles for the worker's queues (a queue is found by name; nothing runs here). */
const handles = (queues: Queues) =>
  WORKER_QUEUES.map((name) => queues.get(defineQueue(name, () => Promise.resolve())));

export function createQueueCounts(queues: Queues) {
  return async () =>
    Promise.all(
      handles(queues).map(async (q) => {
        const c = await q.getJobCounts('waiting', 'delayed', 'active', 'failed');
        return {
          name: q.name,
          waiting: c.waiting ?? 0,
          delayed: c.delayed ?? 0,
          active: c.active ?? 0,
          failed: c.failed ?? 0,
        };
      }),
    );
}

/**
 * `socioboard.queue.jobs` by queue and state (waiting, delayed, active, failed), read when the
 * metrics are exported: a backlog alert in OpenObserve watches it. Telemetry on, worker only (the
 * api would report the same numbers again).
 */
export function observeQueueDepth(queues: Queues): void {
  const counts = createQueueCounts(queues);
  metrics
    .getMeter('socioboard')
    .createObservableGauge('socioboard.queue.jobs', { description: 'Jobs per queue and state' })
    .addCallback(async (result) => {
      for (const q of await counts()) {
        for (const state of ['waiting', 'delayed', 'active', 'failed'] as const) {
          result.observe(q[state], { queue: q.name, state });
        }
      }
    });
}

export const BULL_BOARD_PATH = '/api/admin/queues';

/**
 * Where Bull Board's UI files are. It finds them itself with an eval'd `require`, which an ESM
 * bundle (the API's build) doesn't have, so they're found here instead: through `@bull-board/api`,
 * which depends on the UI package, from wherever this code runs (source in dev, the bundle in the
 * image, the bundle in a workspace checkout on staging).
 */
function bullBoardUiPath() {
  const here = createRequire(import.meta.url);
  let api: string;
  try {
    // Source, and the built api image (one flat node_modules beside the bundle).
    api = here.resolve('@bull-board/api');
  } catch {
    // The bundle in a workspace checkout (staging under PM2): only this package depends on it.
    api = createRequire(here.resolve('@socioboard/core')).resolve('@bull-board/api');
  }
  return dirname(createRequire(api).resolve('@bull-board/ui/package.json'));
}

/**
 * Bull Board at /api/admin/queues, behind `guard` (platform admins with 2FA). Read-only: retrying
 * or cancelling a delivery goes through the audited admin endpoints, never a raw job action.
 */
export function createBullBoardRouter(queues: Queues, guard: RequestHandler): Router {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BULL_BOARD_PATH);
  createBullBoard({
    queues: handles(queues).map((q) => new BullMQAdapter(q, { readOnlyMode: true })),
    serverAdapter,
    options: {
      uiConfig: { boardTitle: 'Socioboard queues' },
      uiBasePath: bullBoardUiPath(),
    },
  });
  const router = Router();
  router.use(BULL_BOARD_PATH, guard, serverAdapter.getRouter() as Router);
  return router;
}
