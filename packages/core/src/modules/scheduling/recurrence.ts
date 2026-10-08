import { RecurrenceRule, type Recurrence } from '@socioboard/contracts';
import { Prisma } from '@socioboard/db';

import {
  conflict,
  defineQueue,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type Logger,
  type MemberContext,
} from '../../platform';
import type { PostEvents, PostService, ScheduledJob } from '../posts';
import type { WorkspaceEvents } from '../workspaces';
import type { SchedulingEvents } from './events';
import { nextOccurrence, occurrencesBetween, ruleBounds, toRRule } from './occurrences';

export interface RecurrenceDeps {
  db: Db;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  posts: PostService;
  enqueueScheduled(jobs: ScheduledJob[]): Promise<void>;
  dropScheduledJobs(jobs: { targetId: string; version: number }[]): Promise<void>;
}

/** Occurrences are created this far ahead (the `recurring` job runs hourly). */
export const RECURRING_HORIZON_DAYS = 7;
const MINUTE = 60_000;
/** An occurrence closer than this is not created: its job couldn't be queued in time. */
const LEAD_MS = 2 * MINUTE;

/**
 * Repeating posts (docs/backend/modules/scheduling.md): a template post holds the content and
 * the rule; each occurrence becomes an ordinary scheduled post (Post.recurringRuleId +
 * occurrenceAt, unique together), created a week ahead. Changing the rule or the template
 * replaces the occurrences still waiting and not changed by hand; stopping removes them.
 */
export function createRecurrenceService(deps: RecurrenceDeps) {
  const { db, clock, logger, posts } = deps;
  const events = typedEvents<SchedulingEvents>(deps.events);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  function toRecurrence(row: { rule: Prisma.JsonValue; active: boolean }): Recurrence | null {
    const rule = RecurrenceRule.safeParse(row.rule);
    if (!rule.success) return null;
    const next = row.active ? nextOccurrence(rule.data, clock.now()) : null;
    return { rule: rule.data, nextRunAt: next?.toISOString() ?? null, active: row.active };
  }

  /** How a post repeats (its active rule), for `GET /posts/:id`. */
  async function get(workspaceId: string, postId: string): Promise<Recurrence | null> {
    const row = await scoped(workspaceId).recurringRule.findFirst({
      where: { postId, active: true },
    });
    return row ? toRecurrence(row) : null;
  }

  /** Makes a draft post repeat (or replaces how it repeats), then creates the first week. */
  async function set(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    rule: RecurrenceRule,
  ): Promise<Recurrence> {
    const { workspaceId } = member;
    await posts.assertVisible(member, postId);
    const post = await scoped(workspaceId).post.findUnique({
      where: { id: postId },
      select: { recurringRuleId: true, targets: { select: { id: true, status: true } } },
    });
    if (!post) throw notFound('POST_NOT_FOUND', 'Post not found');
    if (post.recurringRuleId) {
      throw conflict(
        'POST_IS_OCCURRENCE',
        'This post is one copy of a repeating post; change the repeating post instead',
      );
    }
    const live = post.targets.filter((t) => t.status !== 'cancelled');
    if (live.length === 0) throw unprocessable('NO_ACCOUNTS', 'Choose at least one account');
    if (live.some((t) => t.status === 'scheduled')) {
      throw conflict('POST_IS_SCHEDULED', 'Unschedule this post first, then make it repeat');
    }
    if (live.some((t) => t.status !== 'pending')) {
      throw conflict('POST_ALREADY_SENT', 'This post was already sent; duplicate it to repeat it');
    }
    await posts.assertNoReviewRequired(workspaceId);
    await posts.checkPublishable(
      member,
      postId,
      live.map((t) => t.id),
    );
    if (!nextOccurrence(rule, new Date(clock.now().getTime() + LEAD_MS))) {
      throw unprocessable('RECURRENCE_ENDED', 'This schedule has no dates left; change its end');
    }

    const { startsAt, endsAt } = ruleBounds(rule);
    const fields = {
      rule: rule as unknown as Prisma.InputJsonValue,
      rrule: toRRule(rule),
      timezone: rule.timezone,
      startsAt,
      endsAt,
      active: true,
    };
    const saved = await db.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${postId}::uuid AND "workspaceId" = ${workspaceId}::uuid FOR UPDATE`;
      return tx.recurringRule.upsert({
        where: { postId_workspaceId: { postId, workspaceId } },
        create: { id: newId(), workspaceId, postId, createdById: caller.user.id, ...fields },
        update: fields,
      });
    });
    await sync(workspaceId, saved.id, { replace: true });
    await events.emit('post.recurrence_set', {
      workspaceId,
      postId,
      userId: caller.user.id,
      rrule: fields.rrule,
      timezone: rule.timezone,
    });
    const now = await scoped(workspaceId).recurringRule.findUniqueOrThrow({
      where: { id: saved.id },
    });
    const recurrence = toRecurrence(now);
    if (!recurrence) throw new Error(`Stored rule ${saved.id} does not parse`);
    return recurrence;
  }

  /** Stops repeating: waiting copies go, sent ones stay; the template becomes a plain draft. */
  async function stop(caller: AuthContext, member: MemberContext, postId: string) {
    const { workspaceId } = member;
    await posts.assertVisible(member, postId);
    const rule = await scoped(workspaceId).recurringRule.findFirst({
      where: { postId, active: true },
      select: { id: true },
    });
    if (!rule) throw notFound('RECURRENCE_NOT_FOUND', 'This post doesn’t repeat');
    await db.client.$transaction(async (tx) => {
      await lockRule(tx, rule.id);
      await tx.recurringRule.update({
        where: { id: rule.id, workspaceId },
        data: { active: false, nextRunAt: null },
      });
    });
    const removed = await removeWaiting(workspaceId, rule.id);
    await events.emit('post.recurrence_stopped', {
      workspaceId,
      postId,
      userId: caller.user.id,
      removedOccurrences: removed,
    });
  }

  async function lockRule(tx: Prisma.TransactionClient, ruleId: string) {
    await tx.$queryRaw`SELECT id FROM "RecurringRule" WHERE id = ${ruleId}::uuid FOR UPDATE`;
  }

  /**
   * Deletes a rule's copies that are still waiting (every target pending or scheduled) and weren't
   * changed by hand, each under its post lock; drops their jobs. Returns how many went.
   */
  async function removeWaiting(workspaceId: string, ruleId: string): Promise<number> {
    const candidates = await scoped(workspaceId).post.findMany({
      where: { recurringRuleId: ruleId, customizedAt: null },
      select: { id: true },
    });
    let removed = 0;
    for (const { id } of candidates) {
      const dropped = await db.client.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${id}::uuid AND "workspaceId" = ${workspaceId}::uuid FOR UPDATE`;
        const targets = await tx.postTarget.findMany({
          where: { workspaceId, postId: id },
          select: { id: true, status: true, scheduleVersion: true },
        });
        const waiting = targets.every((t) =>
          ['pending', 'scheduled', 'cancelled'].includes(t.status),
        );
        const row = await tx.post.findFirst({
          where: { id, workspaceId, customizedAt: null },
          select: { id: true },
        });
        if (!waiting || !row) return null;
        await tx.post.delete({ where: { id, workspaceId } });
        return targets.filter((t) => t.status === 'scheduled');
      });
      if (!dropped) continue;
      removed++;
      await deps.dropScheduledJobs(
        dropped.map((t) => ({ targetId: t.id, version: t.scheduleVersion })),
      );
    }
    return removed;
  }

  /**
   * Brings a rule's copies up to date, under the rule's row lock: optionally replaces the waiting
   * ones (rule or template changed), then creates every occurrence in the next week that has no
   * copy yet, scheduled at its time with its own job. Safe to run again: each occurrence's copy is
   * unique. Returns how many copies were created.
   */
  async function sync(
    workspaceId: string,
    ruleId: string,
    { replace = false }: { replace?: boolean } = {},
  ): Promise<number> {
    if (replace) await removeWaiting(workspaceId, ruleId);
    const now = clock.now().getTime();
    const from = new Date(now + LEAD_MS);
    const to = new Date(now + RECURRING_HORIZON_DAYS * 24 * 60 * MINUTE);

    const jobs = await db.client.$transaction(async (tx) => {
      await lockRule(tx, ruleId);
      const rule = await tx.recurringRule.findFirst({ where: { id: ruleId, workspaceId } });
      if (!rule?.active) return [];
      const parsed = RecurrenceRule.safeParse(rule.rule);
      if (!parsed.success) {
        logger.error({ ruleId }, 'a stored recurring rule does not parse; skipped');
        return [];
      }
      const template = await tx.post.findFirst({
        where: { id: rule.postId, workspaceId },
        include: {
          targets: {
            where: { status: { not: 'cancelled' }, account: { status: { not: 'disconnected' } } },
            orderBy: { id: 'asc' },
          },
        },
      });
      const due = occurrencesBetween(parsed.data, from, to);
      const next = nextOccurrence(parsed.data, new Date(to.getTime() + 1));
      await tx.recurringRule.update({
        where: { id: ruleId, workspaceId },
        data: { nextRunAt: next },
      });
      if (!template || template.targets.length === 0 || due.length === 0) return [];

      const existing = new Set(
        (
          await tx.post.findMany({
            where: { workspaceId, recurringRuleId: ruleId, occurrenceAt: { in: due } },
            select: { occurrenceAt: true },
          })
        ).map((p) => p.occurrenceAt?.getTime()),
      );
      const created: ScheduledJob[] = [];
      for (const at of due) {
        if (existing.has(at.getTime())) continue;
        const postId = newId();
        await tx.post.create({
          data: {
            id: postId,
            workspaceId,
            authorId: template.authorId,
            status: 'scheduled',
            text: template.text,
            mediaIds: template.mediaIds,
            link: template.link,
            firstComment: template.firstComment,
            labelIds: template.labelIds,
            recurringRuleId: ruleId,
            occurrenceAt: at,
          },
        });
        for (const t of template.targets) {
          const targetId = newId();
          await tx.postTarget.create({
            data: {
              id: targetId,
              workspaceId,
              postId,
              socialAccountId: t.socialAccountId,
              override: t.override ?? Prisma.DbNull,
              status: 'scheduled',
              scheduledAt: at,
              scheduleVersion: 1,
            },
          });
          created.push({ workspaceId, targetId, version: 1, at });
        }
      }
      return created;
    });
    // If this fails the copies are scheduled without jobs: the reconcile job (P2-B5) rebuilds
    // them from Postgres.
    if (jobs.length) await deps.enqueueScheduled(jobs);
    return new Set(jobs.map((j) => j.at.getTime())).size;
  }

  /** The `recurring` job: every active rule due within the horizon gets its copies. */
  async function expandDue(): Promise<number> {
    const to = new Date(clock.now().getTime() + RECURRING_HORIZON_DAYS * 24 * 60 * MINUTE);
    const due = await db.client.recurringRule.findMany({
      where: {
        active: true,
        workspace: { deletedAt: null },
        OR: [{ nextRunAt: null }, { nextRunAt: { lte: to } }],
      },
      select: { id: true, workspaceId: true },
      take: 1000,
    });
    let created = 0;
    for (const rule of due) {
      try {
        created += await sync(rule.workspaceId, rule.id);
      } catch (err) {
        logger.error({ err, ruleId: rule.id }, 'expanding a recurring rule failed');
      }
    }
    return created;
  }

  /**
   * A deleted workspace publishes nothing more: its repeating rules stop and its scheduled
   * targets are cancelled (their jobs dropped). Returns how many targets were cancelled.
   */
  async function stopWorkspace(workspaceId: string): Promise<number> {
    const ws = scoped(workspaceId);
    await ws.recurringRule.updateMany({
      where: { active: true },
      data: { active: false, nextRunAt: null },
    });
    const scheduled = await ws.postTarget.findMany({
      where: { status: 'scheduled' },
      select: { id: true, postId: true, scheduleVersion: true },
    });
    if (scheduled.length === 0) return 0;
    await ws.postTarget.updateMany({
      where: { id: { in: scheduled.map((t) => t.id) }, status: 'scheduled' },
      data: { status: 'cancelled' },
    });
    await deps.dropScheduledJobs(
      scheduled.map((t) => ({ targetId: t.id, version: t.scheduleVersion })),
    );
    for (const postId of new Set(scheduled.map((t) => t.postId))) {
      await posts.recomputeStatus(workspaceId, postId);
    }
    return scheduled.length;
  }

  /**
   * Listeners: a template's content changed (replace its copies), or it was deleted; a workspace
   * was deleted (stop everything it had scheduled).
   */
  function registerListeners() {
    typedEvents<WorkspaceEvents>(deps.events).on('workspace.deleted', async (p) => {
      try {
        await stopWorkspace(p.workspaceId);
      } catch (err) {
        logger.error(
          { err, workspaceId: p.workspaceId },
          'stopping a deleted workspace’s posts failed',
        );
      }
    });
    const postEvents = typedEvents<PostEvents>(deps.events);
    postEvents.on('post.updated', async (p) => {
      try {
        const rule = await scoped(p.workspaceId).recurringRule.findFirst({
          where: { postId: p.postId, active: true },
          select: { id: true },
        });
        if (rule) await sync(p.workspaceId, rule.id, { replace: true });
      } catch (err) {
        logger.error({ err, postId: p.postId }, 'refreshing a repeating post’s copies failed');
      }
    });
    postEvents.on('post.deleted', async (p) => {
      if (!p.templateOfRuleId) return;
      try {
        await removeWaiting(p.workspaceId, p.templateOfRuleId);
      } catch (err) {
        logger.error({ err, postId: p.postId }, 'removing a deleted template’s copies failed');
      }
    });
  }

  return { get, set, stop, sync, expandDue, stopWorkspace, registerListeners };
}

export type RecurrenceService = ReturnType<typeof createRecurrenceService>;

/** `recurring` (hourly): expands active rules a week ahead. */
export const recurringQueue = (recurrence: RecurrenceService) =>
  defineQueue('recurring', async () => {
    await recurrence.expandDue();
  });
