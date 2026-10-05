import {
  addDays,
  parseLocalDate,
  parseTime,
  SCHEDULE_MAX_AHEAD_DAYS,
  SCHEDULE_MIN_LEAD_MINUTES,
  toLocalDate,
  toTimeOfDay,
  wallClock,
  weekdayOf,
  zonedTime,
  type Post,
  type Recurrence,
  type RecurrenceFrequency,
  type RecurrenceRuleInput,
} from '@socioboard/contracts';
import type { DateTimeValue } from '@socioboard/ui';

/**
 * What the schedule dialog holds (docs/frontend/areas/composer.md, "Schedule"): a day and time on
 * the workspace's clock, and how the post repeats. Everything here is on that clock; only
 * `instantOf` turns it into a moment in time, with the server's own daylight-saving rule.
 */
export interface ScheduleForm {
  when: DateTimeValue;
  repeat: 'none' | RecurrenceFrequency;
  /** Every n days, weeks or months (1–12). */
  interval: number;
  /** Weekly: 0 = Sunday … 6 = Saturday. Null follows the chosen day's weekday. */
  weekdays: number[] | null;
  /** Monthly: on the chosen day's number, or each month's last day. */
  monthDay: 'same' | 'last';
  ends: 'never' | 'on' | 'after';
  endDate: string;
  count: number;
}

/** The moment a day and time on the workspace's clock happens. */
export function instantOf(when: DateTimeValue, timeZone: string): Date {
  return zonedTime(parseLocalDate(when.date), parseTime(when.time), timeZone);
}

/** A moment as a day and time on the workspace's clock. */
export function whenOf(instant: Date | string, timeZone: string): DateTimeValue {
  const w = wallClock(new Date(instant).getTime(), timeZone);
  return { date: toLocalDate(w), time: toTimeOfDay(w) };
}

const QUARTER = 15 * 60_000;

/** What the dialog opens on: an hour from now, on the next quarter of an hour. */
export function defaultWhen(now: Date, timeZone: string): DateTimeValue {
  const at = Math.ceil((now.getTime() + 60 * 60_000) / QUARTER) * QUARTER;
  return whenOf(new Date(at), timeZone);
}

/** The days the picker offers: today to a year ahead, on the workspace's clock. */
export function dateBounds(now: Date, timeZone: string): { min: string; max: string } {
  const today = wallClock(now.getTime(), timeZone);
  return {
    min: toLocalDate(today),
    max: whenOf(new Date(now.getTime() + SCHEDULE_MAX_AHEAD_DAYS * 86_400_000), timeZone).date,
  };
}

/** When the post is due: its scheduled accounts' time (the earliest, if they differ). */
export function scheduledAt(post: Post | undefined): string | null {
  const times = (post?.targets ?? [])
    .map((t) => (t.status === 'scheduled' ? t.scheduledAt : null))
    .filter((at): at is string => at !== null)
    .sort();
  return times[0] ?? null;
}

/** Its scheduled accounts go out at more than one time (moved one by one on the calendar). */
export function hasSeveralTimes(post: Post | undefined): boolean {
  const times = new Set(
    (post?.targets ?? []).filter((t) => t.status === 'scheduled').map((t) => t.scheduledAt),
  );
  return times.size > 1;
}

/** The dialog's starting point: the post's schedule or rule when it has one, else an hour away. */
export function initialForm(input: {
  initialAt?: string | undefined;
  post: Post | undefined;
  recurrence: Recurrence | null;
  now: Date;
  timeZone: string;
}): ScheduleForm {
  const { post, recurrence, now, timeZone } = input;
  const due = scheduledAt(post) ?? input.initialAt;
  const base: ScheduleForm = {
    when: due ? whenOf(due, timeZone) : defaultWhen(now, timeZone),
    repeat: 'none',
    interval: 1,
    weekdays: null,
    monthDay: 'same',
    ends: 'never',
    endDate: '',
    count: 10,
  };
  if (!recurrence?.active) return base;
  const { rule } = recurrence;
  return {
    ...base,
    when: { date: rule.startsOn, time: rule.time },
    repeat: rule.frequency,
    interval: rule.interval,
    weekdays: rule.weekdays ?? null,
    monthDay: rule.monthDay === -1 ? 'last' : 'same',
    ends: rule.ends.type,
    endDate: rule.ends.type === 'on' ? rule.ends.date : '',
    count: rule.ends.type === 'after' ? rule.ends.count : base.count,
  };
}

/** The weekdays a weekly rule falls on: the chosen ones, else the chosen day's own. */
export function weekdaysOf(form: ScheduleForm): number[] {
  return form.weekdays ?? [weekdayOf(parseLocalDate(form.when.date))];
}

/** A month after the chosen day: what "ends on" starts from. */
export function defaultEndDate(form: ScheduleForm): string {
  return toLocalDate(addDays(parseLocalDate(form.when.date), 30));
}

export type ScheduleProblem = 'tooSoon' | 'tooFar' | 'endsBeforeStart' | 'endDateMissing' | 'count';

/**
 * Why the form can't be sent yet, by the server's own bounds (a one-time schedule is from 2
 * minutes to a year ahead). A repeating post may start today at a time already past: its first
 * date is then the next one.
 */
export function problemOf(form: ScheduleForm, now: Date, timeZone: string): ScheduleProblem | null {
  if (form.repeat === 'none') {
    const at = instantOf(form.when, timeZone).getTime();
    if (at < now.getTime() + SCHEDULE_MIN_LEAD_MINUTES * 60_000) return 'tooSoon';
    if (at > now.getTime() + SCHEDULE_MAX_AHEAD_DAYS * 86_400_000) return 'tooFar';
    return null;
  }
  if (form.ends === 'on') {
    if (!form.endDate) return 'endDateMissing';
    if (form.endDate < form.when.date) return 'endsBeforeStart';
  }
  if (
    form.ends === 'after' &&
    !(Number.isInteger(form.count) && form.count >= 1 && form.count <= 365)
  )
    return 'count';
  return null;
}

/** The rule the API takes, in the workspace's timezone. Only for a form that repeats. */
export function ruleOf(form: ScheduleForm, timeZone: string): RecurrenceRuleInput {
  if (form.repeat === 'none') throw new Error('The form does not repeat');
  return {
    frequency: form.repeat,
    interval: form.interval,
    ...(form.repeat === 'weekly' ? { weekdays: weekdaysOf(form) } : {}),
    ...(form.repeat === 'monthly'
      ? { monthDay: form.monthDay === 'last' ? -1 : parseLocalDate(form.when.date).day }
      : {}),
    time: form.when.time,
    timezone: timeZone,
    startsOn: form.when.date,
    ends:
      form.ends === 'on'
        ? { type: 'on', date: form.endDate }
        : form.ends === 'after'
          ? { type: 'after', count: form.count }
          : { type: 'never' },
  };
}
