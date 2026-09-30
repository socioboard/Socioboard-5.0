import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { Timezone } from './fields';
import { Post, PublishError, TargetAccount, TargetStatus } from './posts';
import { Recurrence, RecurrenceRule, TimeOfDay, Weekday } from './recurrence';
import { defineRoute } from './route';

/**
 * When posts go out (docs/backend/modules/scheduling.md). Times travel as UTC ISO strings; the UI
 * shows them in the workspace's timezone. Rules that repeat keep their own timezone, so a post at
 * 09:00 stays at 09:00 across daylight saving.
 */

/** A schedule must be at least this far ahead, so the job is queued before it's due. */
export const SCHEDULE_MIN_LEAD_MINUTES = 2;
/** And at most this far ahead. */
export const SCHEDULE_MAX_AHEAD_DAYS = 365;

// ── Schedule ────────────────────────────────────────────────────────────────────────────────────

/**
 * Every waiting target goes at `at`, except those listed in `targets`, which go at their own
 * time. The server checks each time is between now + 2 minutes and 1 year ahead.
 */
export const SchedulePostBody = z.object({
  at: IsoDateTime,
  targets: z
    .array(z.object({ targetId: Id, at: IsoDateTime }))
    .max(100)
    .refine(
      (targets) => new Set(targets.map((t) => t.targetId)).size === targets.length,
      'The same target is given two times',
    )
    .default([]),
});
export type SchedulePostBody = z.infer<typeof SchedulePostBody>;

/**
 * Move one target (calendar drag-and-drop). `previousAt` is the time the client showed: if the
 * target moved since (another person, another tab), the API refuses with SCHEDULE_CHANGED rather
 * than overwrite that change.
 */
export const RescheduleTargetBody = z.object({ at: IsoDateTime, previousAt: IsoDateTime });
export type RescheduleTargetBody = z.infer<typeof RescheduleTargetBody>;

// ── Calendar ────────────────────────────────────────────────────────────────────────────────────

/** A month view shows six weeks; a little more leaves room without allowing whole-year dumps. */
export const CALENDAR_MAX_DAYS = 62;
/** Entries per response; `truncated` says there were more (narrow the range or filters). */
export const CALENDAR_MAX_ENTRIES = 1000;

const repeatable = <T extends z.ZodType>(item: T) =>
  z.union([item, z.array(item)]).transform((v) => (Array.isArray(v) ? v : [v]) as z.infer<T>[]);

export const CalendarQuery = z
  .object({
    from: IsoDateTime,
    to: IsoDateTime,
    /** Repeat to show several accounts (`?accountId=…&accountId=…`); omit for all. */
    accountId: repeatable(Id).optional(),
    status: repeatable(TargetStatus).optional(),
    labelId: Id.optional(),
  })
  .refine((q) => Date.parse(q.from) < Date.parse(q.to), {
    path: ['to'],
    message: '`to` must be after `from`',
  })
  .refine((q) => Date.parse(q.to) - Date.parse(q.from) <= CALENDAR_MAX_DAYS * 86_400_000, {
    path: ['to'],
    message: `At most ${CALENDAR_MAX_DAYS} days at a time`,
  });
export type CalendarQuery = z.infer<typeof CalendarQuery>;

/**
 * One target on the calendar. The UI groups a post's targets at the same time into one card.
 * `at` is when it went out (published), else when it's due (scheduled), else when it was last
 * tried (a failed publish-now). Drafts without a time aren't on the calendar.
 */
export const CalendarEntry = z.object({
  targetId: Id,
  postId: Id,
  account: TargetAccount,
  status: TargetStatus,
  at: IsoDateTime,
  /** The start of what this account gets (its override, else the shared text), ≤ 280 characters. */
  text: z.string().max(280),
  thumbnailUrl: z.url().nullable(),
  mediaCount: z.number().int().nonnegative(),
  labelIds: z.array(Id),
  /** Created by a recurring rule. */
  recurring: z.boolean(),
  permalink: z.url().nullable(),
  lastError: PublishError.nullable(),
});
export type CalendarEntry = z.infer<typeof CalendarEntry>;

export const CalendarResponse = z.object({
  items: z.array(CalendarEntry),
  truncated: z.boolean(),
});
export type CalendarResponse = z.infer<typeof CalendarResponse>;

// ── Queue slots ─────────────────────────────────────────────────────────────────────────────────

/** Slots per account: 20 a day is already more than any network welcomes. */
export const QUEUE_MAX_SLOTS = 140;
/** Upcoming slot times returned with an account's slots, for the queue view. */
export const QUEUE_UPCOMING = 14;

export const QueueSlot = z.object({ weekday: Weekday, time: TimeOfDay });
export type QueueSlot = z.infer<typeof QueueSlot>;

/** Replaces all of an account's slots. An empty list turns "Add to queue" off for the account. */
export const PutQueueSlotsBody = z.object({
  timezone: Timezone,
  slots: z
    .array(QueueSlot)
    .max(QUEUE_MAX_SLOTS)
    .refine(
      (slots) => new Set(slots.map((s) => `${s.weekday} ${s.time}`)).size === slots.length,
      'The same slot is listed twice',
    ),
});
export type PutQueueSlotsBody = z.infer<typeof PutQueueSlotsBody>;

export const QueueSlots = z.object({
  /** The slots' timezone; the workspace's while the account has none. */
  timezone: Timezone,
  /** By weekday, then time. */
  slots: z.array(QueueSlot),
  /**
   * The next slot times (UTC, daylight saving applied) with what's already in each: empty means
   * free. More than one when a post was scheduled by hand at a slot's time.
   */
  upcoming: z.array(z.object({ at: IsoDateTime, entries: z.array(CalendarEntry) })),
});
export type QueueSlots = z.infer<typeof QueueSlots>;

// ── Routes ──────────────────────────────────────────────────────────────────────────────────────

const workspaceParams = z.object({ workspaceId: Id });
const postParams = workspaceParams.extend({ postId: Id });

export const schedulingRoutes = {
  schedulePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/schedule',
    access: 'posts:publish',
    summary: 'Schedule every waiting target at a time, or some at their own times',
    params: postParams,
    body: SchedulePostBody,
    responses: { 200: Post },
  }),
  queuePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/queue',
    access: 'posts:publish',
    summary: 'Schedule each waiting target in its account’s next free queue slot',
    params: postParams,
    responses: { 200: Post },
  }),
  unschedulePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/unschedule',
    access: 'posts:publish',
    summary: 'Take the scheduled targets back to waiting; the post becomes a draft again',
    params: postParams,
    responses: { 200: Post },
  }),
  rescheduleTarget: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/targets/:targetId/schedule',
    access: 'posts:publish',
    summary: 'Move one scheduled target to a new time (calendar drag-and-drop)',
    params: workspaceParams.extend({ targetId: Id }),
    body: RescheduleTargetBody,
    responses: { 200: Post },
  }),
  setRecurrence: defineRoute({
    method: 'PUT',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/recurrence',
    access: 'posts:publish',
    summary: 'Make the post repeat, or replace how it repeats',
    params: postParams,
    body: RecurrenceRule,
    responses: { 200: Recurrence },
  }),
  deleteRecurrence: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/recurrence',
    access: 'posts:publish',
    summary: 'Stop repeating; occurrences already published stay',
    params: postParams,
    responses: { 204: null },
  }),
  getCalendar: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/calendar',
    access: 'calendar:read',
    summary: 'Scheduled, publishing, published and failed targets in a date range',
    params: workspaceParams,
    query: CalendarQuery,
    responses: { 200: CalendarResponse },
  }),
  getQueueSlots: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/accounts/:accountId/queue-slots',
    access: 'calendar:read',
    summary: 'An account’s posting times and its next slots',
    params: workspaceParams.extend({ accountId: Id }),
    responses: { 200: QueueSlots },
  }),
  putQueueSlots: defineRoute({
    method: 'PUT',
    path: '/api/v1/workspaces/:workspaceId/accounts/:accountId/queue-slots',
    access: 'accounts:manage',
    summary: 'Replace an account’s posting times',
    params: workspaceParams.extend({ accountId: Id }),
    body: PutQueueSlotsBody,
    responses: { 200: QueueSlots },
  }),
};
