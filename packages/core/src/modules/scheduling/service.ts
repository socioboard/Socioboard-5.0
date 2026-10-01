import {
  SCHEDULE_MAX_AHEAD_DAYS,
  SCHEDULE_MIN_LEAD_MINUTES,
  type RescheduleTargetBody,
  type SchedulePostBody,
} from '@socioboard/contracts';
import { Prisma } from '@socioboard/db';

import {
  conflict,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type MemberContext,
} from '../../platform';
import { WAITING_TARGET, type PostService, type ScheduledJob } from '../posts';
import type { SchedulingEvents } from './events';
import { slotTimes } from './time';

export interface SchedulingDeps {
  db: Db;
  clock: Clock;
  events: EventBus<Record<string, unknown>>;
  posts: PostService;
  /** publishing: a delayed publish job per scheduled target, for its schedule version. */
  enqueueScheduled(jobs: ScheduledJob[]): Promise<void>;
  /** publishing: drops jobs of older versions (best effort; they'd find nothing to do). */
  dropScheduledJobs(jobs: { targetId: string; version: number }[]): Promise<void>;
}

const MINUTE = 60_000;

interface TargetState {
  id: string;
  status: string;
  scheduledAt: Date | null;
  scheduleVersion: number;
}

/**
 * When posts go out (docs/backend/modules/scheduling.md): schedule, unschedule, reschedule.
 * Postgres holds each target's time and schedule version; every change bumps the version and
 * queues a delayed `publish` job for it, so a job queued for an older version finds nothing to do.
 * Changes lock the post row (as editing and publish-now do), so they can't interleave.
 */
export function createSchedulingService(deps: SchedulingDeps) {
  const { db, clock, posts } = deps;
  const events = typedEvents<SchedulingEvents>(deps.events);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  /** Between now + 2 minutes and a year ahead, so the job is queued before it's due. */
  function checkTime(at: Date, targetId?: string) {
    const now = clock.now().getTime();
    const earliest = new Date(now + SCHEDULE_MIN_LEAD_MINUTES * MINUTE);
    const latest = new Date(now + SCHEDULE_MAX_AHEAD_DAYS * 24 * 60 * MINUTE);
    const details = (limit: Date) => ({
      ...(targetId ? { targetId } : {}),
      limit: limit.toISOString(),
    });
    if (at < earliest) {
      throw unprocessable(
        'SCHEDULE_TOO_SOON',
        `Pick a time at least ${String(SCHEDULE_MIN_LEAD_MINUTES)} minutes from now`,
        details(earliest),
      );
    }
    if (at > latest) {
      throw unprocessable('SCHEDULE_TOO_FAR', 'Pick a time within the next year', details(latest));
    }
  }

  /** A repeating post's occurrence changed by hand: its rule no longer replaces it. */
  async function markCustomized(tx: Prisma.TransactionClient, workspaceId: string, postId: string) {
    await tx.post.updateMany({
      where: { id: postId, workspaceId, recurringRuleId: { not: null } },
      data: { customizedAt: clock.now() },
    });
  }

  async function lockPost(tx: Prisma.TransactionClient, workspaceId: string, postId: string) {
    await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${postId}::uuid AND "workspaceId" = ${workspaceId}::uuid FOR UPDATE`;
  }

  const targetSelect = {
    id: true,
    socialAccountId: true,
    status: true,
    scheduledAt: true,
    scheduleVersion: true,
  } as const;

  async function liveTargets(workspaceId: string, postId: string) {
    const post = await scoped(workspaceId).post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw notFound('POST_NOT_FOUND', 'Post not found');
    return scoped(workspaceId).postTarget.findMany({
      where: { postId, status: { not: 'cancelled' } },
      select: targetSelect,
      orderBy: { id: 'asc' },
    });
  }

  const alreadySent = () =>
    conflict(
      'POST_ALREADY_SENT',
      'This post was already sent; retry the accounts that failed instead',
    );

  /**
   * Queues the new versions' jobs, then drops the old ones. If queueing fails, the targets go
   * back to their previous time and version (whose jobs are still there), and the error stands.
   */
  async function queueOrRevert(workspaceId: string, before: TargetState[], after: ScheduledJob[]) {
    try {
      await deps.enqueueScheduled(after);
    } catch (err) {
      for (const old of before) {
        const next = after.find((a) => a.targetId === old.id);
        if (!next) continue;
        await scoped(workspaceId).postTarget.updateMany({
          where: { id: old.id, scheduleVersion: next.version },
          data: {
            status: old.status as 'pending' | 'scheduled',
            scheduledAt: old.scheduledAt,
            scheduleVersion: old.scheduleVersion,
          },
        });
      }
      throw err;
    }
    await dropOld(before);
  }

  async function dropOld(before: TargetState[]) {
    const old = before.filter((t) => t.status === 'scheduled');
    if (old.length === 0) return;
    await deps.dropScheduledJobs(old.map((t) => ({ targetId: t.id, version: t.scheduleVersion })));
  }

  /** The post's live targets, if they can be scheduled: all waiting, reviewed, no errors. */
  async function prepare(member: MemberContext, postId: string) {
    const { workspaceId } = member;
    const live = await liveTargets(workspaceId, postId);
    if (live.length === 0) throw unprocessable('NO_ACCOUNTS', 'Choose at least one account');
    if (live.some((t) => !WAITING_TARGET.includes(t.status))) throw alreadySent();
    await posts.assertNotTemplate(workspaceId, postId);
    await posts.assertNoReviewRequired(workspaceId);
    await posts.checkPublishable(
      member,
      postId,
      live.map((t) => t.id),
    );
    return live;
  }

  type LiveRow = Awaited<ReturnType<typeof liveTargets>>[number];

  /**
   * Under the post lock: checks nothing changed since `prepare`, asks `decide` for each target's
   * time, then gives every target its time and a new version; after commit, queues the jobs
   * (reverting if that fails), recomputes the status and emits post.scheduled.
   */
  async function commit(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    live: LiveRow[],
    decide: (tx: Prisma.TransactionClient, rows: LiveRow[]) => Promise<Map<string, Date>>,
  ) {
    const { workspaceId } = member;
    const { before, after } = await db.client.$transaction(async (tx) => {
      await lockPost(tx, workspaceId, postId);
      const rows = await tx.postTarget.findMany({
        where: { workspaceId, postId, status: { not: 'cancelled' } },
        select: targetSelect,
        orderBy: { id: 'asc' },
      });
      // Something was sent or changed between the checks and the lock.
      const known = new Set(live.map((t) => t.id));
      if (
        rows.length !== live.length ||
        rows.some((t) => !WAITING_TARGET.includes(t.status) || !known.has(t.id))
      ) {
        throw alreadySent();
      }
      const times = await decide(tx, rows);
      await markCustomized(tx, workspaceId, postId);
      const jobs: ScheduledJob[] = [];
      for (const t of rows) {
        const at = times.get(t.id);
        if (!at) throw new Error(`No time decided for target ${t.id}`);
        const version = t.scheduleVersion + 1;
        await tx.postTarget.update({
          where: { id: t.id, workspaceId },
          data: {
            status: 'scheduled',
            scheduledAt: at,
            scheduleVersion: version,
            lastError: Prisma.DbNull,
          },
        });
        jobs.push({ workspaceId, targetId: t.id, version, at });
      }
      return { before: rows, after: jobs };
    });
    await queueOrRevert(workspaceId, before, after);
    await posts.recomputeStatus(workspaceId, postId);
    await events.emit('post.scheduled', {
      workspaceId,
      postId,
      userId: caller.user.id,
      targets: after.map((j) => ({ targetId: j.targetId, at: j.at.toISOString() })),
    });
    return posts.view(workspaceId, postId);
  }

  /** Schedules every waiting target at `at`, or the listed ones at their own times. */
  async function schedule(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    body: SchedulePostBody,
  ) {
    const live = await liveTargets(member.workspaceId, postId);
    const times = new Map(live.map((t) => [t.id, new Date(body.at)]));
    for (const own of body.targets) {
      if (!times.has(own.targetId)) throw notFound('TARGET_NOT_FOUND', 'Target not found');
      times.set(own.targetId, new Date(own.at));
    }
    for (const [targetId, at] of times) checkTime(at, body.targets.length ? targetId : undefined);
    const ready = await prepare(member, postId);
    return commit(caller, member, postId, ready, () => Promise.resolve(times));
  }

  /**
   * "Add to queue": each waiting target goes in its account's next free queue slot (from now +
   * 2 minutes, within a year). Accounts are locked (advisory, per account, in id order) while
   * their slots are picked, so two posts queued at once never take the same slot. Refused with
   * NO_QUEUE_SLOTS, naming the accounts, if any has no free slot.
   */
  async function queue(caller: AuthContext, member: MemberContext, postId: string) {
    const { workspaceId } = member;
    const live = await prepare(member, postId);
    return commit(caller, member, postId, live, async (tx, rows) => {
      const accountIds = [...new Set(rows.map((t) => t.socialAccountId))].sort();
      for (const id of accountIds) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`queue:${id}`}, 0))`;
      }
      const now = clock.now().getTime();
      const earliest = new Date(now + SCHEDULE_MIN_LEAD_MINUTES * MINUTE);
      const latest = new Date(now + SCHEDULE_MAX_AHEAD_DAYS * 24 * 60 * MINUTE);
      const slots = await tx.queueSlot.findMany({
        where: { workspaceId, socialAccountId: { in: accountIds } },
      });
      // Taken: other posts' targets on these accounts at a slot's time (this post's don't count).
      const taken = await tx.postTarget.findMany({
        where: {
          workspaceId,
          socialAccountId: { in: accountIds },
          postId: { not: postId },
          status: { in: ['scheduled', 'publishing', 'published'] },
          scheduledAt: { gte: earliest },
        },
        select: { socialAccountId: true, scheduledAt: true },
      });
      const busy = new Set(
        taken.map((t) => `${t.socialAccountId} ${String(t.scheduledAt?.getTime())}`),
      );
      const times = new Map<string, Date>();
      const missing: string[] = [];
      for (const t of rows) {
        const own = slots.filter((x) => x.socialAccountId === t.socialAccountId);
        const timezone = own[0]?.timezone ?? 'UTC';
        let found: Date | undefined;
        for (const at of slotTimes(own, timezone, earliest)) {
          if (at > latest) break;
          if (!busy.has(`${t.socialAccountId} ${String(at.getTime())}`)) {
            found = at;
            break;
          }
        }
        if (!found) {
          missing.push(t.socialAccountId);
          continue;
        }
        busy.add(`${t.socialAccountId} ${String(found.getTime())}`);
        times.set(t.id, found);
      }
      if (missing.length) {
        throw unprocessable(
          'NO_QUEUE_SLOTS',
          'Some accounts have no free posting time; add queue slots for them first',
          { accountIds: [...new Set(missing)] },
        );
      }
      return times;
    });
  }

  /** Takes the scheduled targets back to waiting; the post becomes a draft again. */
  async function unschedule(caller: AuthContext, member: MemberContext, postId: string) {
    const { workspaceId } = member;
    const live = await liveTargets(workspaceId, postId);
    const notScheduled = () => conflict('POST_NOT_SCHEDULED', 'This post isn’t scheduled');
    if (!live.some((t) => t.status === 'scheduled')) throw notScheduled();

    const before = await db.client.$transaction(async (tx) => {
      await lockPost(tx, workspaceId, postId);
      const scheduled = await tx.postTarget.findMany({
        where: { workspaceId, postId, status: 'scheduled' },
        select: { id: true, status: true, scheduledAt: true, scheduleVersion: true },
      });
      if (scheduled.length === 0) throw notScheduled();
      await markCustomized(tx, workspaceId, postId);
      await tx.postTarget.updateMany({
        where: { workspaceId, id: { in: scheduled.map((t) => t.id) }, status: 'scheduled' },
        data: { status: 'pending', scheduledAt: null, scheduleVersion: { increment: 1 } },
      });
      return scheduled;
    });
    await dropOld(before);
    await posts.recomputeStatus(workspaceId, postId);
    await events.emit('post.unscheduled', {
      workspaceId,
      postId,
      userId: caller.user.id,
      targetIds: before.map((t) => t.id),
    });
    return posts.view(workspaceId, postId);
  }

  /**
   * Moves one scheduled target (calendar drag-and-drop). `previousAt` is the time the client
   * showed; if the target moved since, SCHEDULE_CHANGED says where it is now.
   */
  async function reschedule(
    caller: AuthContext,
    member: MemberContext,
    targetId: string,
    body: RescheduleTargetBody,
  ) {
    const { workspaceId } = member;
    const target = await scoped(workspaceId).postTarget.findUnique({
      where: { id: targetId },
      select: { postId: true },
    });
    if (!target) throw notFound('TARGET_NOT_FOUND', 'Target not found');
    const at = new Date(body.at);
    checkTime(at);

    const { before, after } = await db.client.$transaction(async (tx) => {
      await lockPost(tx, workspaceId, target.postId);
      const now = await tx.postTarget.findUniqueOrThrow({
        where: { id: targetId, workspaceId },
        select: { id: true, status: true, scheduledAt: true, scheduleVersion: true },
      });
      if (now.status !== 'scheduled') {
        throw conflict(
          'TARGET_NOT_SCHEDULED',
          'Only a scheduled post can be moved; this one is being sent, was sent or was stopped',
        );
      }
      if (now.scheduledAt?.getTime() !== Date.parse(body.previousAt)) {
        throw conflict('SCHEDULE_CHANGED', 'Someone moved this post meanwhile', {
          at: now.scheduledAt?.toISOString() ?? null,
        });
      }
      const version = now.scheduleVersion + 1;
      await tx.postTarget.update({
        where: { id: targetId, workspaceId },
        data: { scheduledAt: at, scheduleVersion: version },
      });
      await markCustomized(tx, workspaceId, target.postId);
      return { before: [now], after: [{ workspaceId, targetId, version, at }] };
    });
    await queueOrRevert(workspaceId, before, after);
    // The status stays; recomputing tells open calendars the new time.
    await posts.recomputeStatus(workspaceId, target.postId);
    await events.emit('post.rescheduled', {
      workspaceId,
      postId: target.postId,
      targetId,
      userId: caller.user.id,
      from: body.previousAt,
      to: at.toISOString(),
    });
    return posts.view(workspaceId, target.postId);
  }

  return { schedule, queue, unschedule, reschedule };
}

export type SchedulingService = ReturnType<typeof createSchedulingService>;
