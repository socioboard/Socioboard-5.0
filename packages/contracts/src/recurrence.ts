import { z } from 'zod';

import { IsoDateTime } from './common';
import { Timezone } from './fields';

/**
 * How a post repeats (docs/backend/modules/scheduling.md). Kept apart from the scheduling routes
 * so a post's details can carry its rule without the two modules importing each other.
 */

/** 0 = Sunday … 6 = Saturday, as `Date.getDay()`. */
export const Weekday = z.number().int().min(0).max(6);
export type Weekday = z.infer<typeof Weekday>;

/** Wall-clock time in a timezone, `HH:mm` (24-hour). */
export const TimeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm, e.g. 09:30');
export type TimeOfDay = z.infer<typeof TimeOfDay>;

/** A calendar date with no time, `YYYY-MM-DD`. */
export const LocalDate = z.iso.date();

export const RecurrenceFrequency = z.enum(['daily', 'weekly', 'monthly']);
export type RecurrenceFrequency = z.infer<typeof RecurrenceFrequency>;

export const RecurrenceEnd = z.discriminatedUnion('type', [
  z.object({ type: z.literal('never') }),
  /** The last day an occurrence may fall on, in the rule's timezone. */
  z.object({ type: z.literal('on'), date: LocalDate }),
  z.object({ type: z.literal('after'), count: z.number().int().min(1).max(365) }),
]);
export type RecurrenceEnd = z.infer<typeof RecurrenceEnd>;

/**
 * How a post repeats: what the recurrence picker offers. The API stores it as an RFC 5545 RRULE,
 * so it never has to accept arbitrary RRULE text.
 * - `weekly` needs `weekdays`; `monthly` needs `monthDay` (-1 = the last day of each month);
 *   `daily` takes neither.
 * - `interval`: every n days, weeks or months.
 */
export const RecurrenceRule = z
  .object({
    frequency: RecurrenceFrequency,
    interval: z.number().int().min(1).max(12).default(1),
    weekdays: z
      .array(Weekday)
      .min(1)
      .max(7)
      .refine((days) => new Set(days).size === days.length, 'The same day is chosen twice')
      .transform((days) => [...days].sort((a, b) => a - b))
      .optional(),
    monthDay: z
      .number()
      .int()
      .refine((d) => d === -1 || (d >= 1 && d <= 31), 'Use 1–31, or -1 for the last day')
      .optional(),
    time: TimeOfDay,
    timezone: Timezone,
    startsOn: LocalDate,
    ends: RecurrenceEnd.default({ type: 'never' }),
  })
  .superRefine((rule, ctx) => {
    const wants = { daily: null, weekly: 'weekdays', monthly: 'monthDay' } as const;
    for (const field of ['weekdays', 'monthDay'] as const) {
      const needed = wants[rule.frequency] === field;
      if (needed && rule[field] === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `A ${rule.frequency} rule needs ${field}`,
        });
      }
      if (!needed && rule[field] !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `A ${rule.frequency} rule takes no ${field}`,
        });
      }
    }
    if (rule.ends.type === 'on' && rule.ends.date < rule.startsOn) {
      ctx.addIssue({ code: 'custom', path: ['ends', 'date'], message: 'Ends before it starts' });
    }
  });
export type RecurrenceRule = z.infer<typeof RecurrenceRule>;
export type RecurrenceRuleInput = z.input<typeof RecurrenceRule>;

export const Recurrence = z.object({
  rule: RecurrenceRule,
  /** The next occurrence, or null once the rule has ended. */
  nextRunAt: IsoDateTime.nullable(),
  active: z.boolean(),
});
export type Recurrence = z.infer<typeof Recurrence>;
