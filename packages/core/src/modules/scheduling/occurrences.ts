import type { RecurrenceRule } from '@socioboard/contracts';

import { parseTime, weekdayOf, zonedTime } from './time';

interface Day {
  year: number;
  month: number;
  day: number;
}

const parseDate = (iso: string): Day => {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 1, day: d ?? 1 };
};
const dayNumber = (d: Day) => Date.UTC(d.year, d.month - 1, d.day) / 86_400_000;
const fromNumber = (n: number): Day => {
  const d = new Date(n * 86_400_000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
};
const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();
/** Weeks start on Monday, as in RFC 5545 (WKST=MO). */
const mondayNumber = (d: Day) => dayNumber(d) - ((weekdayOf(d) + 6) % 7);

/**
 * How far a rule is followed: a hundred years. Bounds every loop, including rules that can never
 * fall on a day (monthly on the 31st every 12 months from February).
 */
const HORIZON_DAYS = 36_600;

/**
 * Calendar days the rule falls on, in order, from `startsOn`, starting near `near` (a day number)
 * when given: the iteration jumps there instead of walking from the start.
 */
function* ruleDays(rule: RecurrenceRule, near?: number): Generator<Day, void, undefined> {
  const start = parseDate(rule.startsOn);
  const startNo = dayNumber(start);
  const skip = near !== undefined ? Math.max(0, near - startNo) : 0;
  const { interval } = rule;

  if (rule.frequency === 'daily') {
    for (let k = Math.floor(skip / interval); k * interval <= HORIZON_DAYS; k++) {
      yield fromNumber(startNo + k * interval);
    }
    return;
  }
  if (rule.frequency === 'weekly') {
    const days = new Set(rule.weekdays ?? []);
    const firstWeek = mondayNumber(start);
    for (let n = startNo + Math.max(0, skip - 7); n <= startNo + HORIZON_DAYS; n++) {
      const day = fromNumber(n);
      const week = Math.floor((mondayNumber(day) - firstWeek) / 7);
      if (week % interval === 0 && days.has(weekdayOf(day))) yield day;
    }
    return;
  }
  // monthly: every `interval` months from the start's month; a day the month lacks is skipped
  // (RFC 5545); -1 is always the last day.
  const skipMonths = Math.floor(skip / 31);
  for (let k = Math.max(0, Math.floor(skipMonths / interval) - 1); k * interval <= 1200; k++) {
    const monthIndex = start.month - 1 + k * interval;
    const year = start.year + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const length = daysInMonth(year, month);
    const day = rule.monthDay === -1 ? length : (rule.monthDay ?? start.day);
    if (day > length) continue;
    const candidate = { year, month, day };
    if (dayNumber(candidate) >= startNo) yield candidate;
  }
}

/**
 * Occurrences of a rule as instants, in order, honouring its end (a last date, or a count from
 * the start). The wall-clock time follows the rule's timezone across daylight saving (skipped
 * times move forward by the gap; repeated ones use the first). With `from`, occurrences before it
 * are skipped, cheaply unless the rule ends after a count (counted from the start).
 */
export function* occurrences(rule: RecurrenceRule, from?: Date): Generator<Date, void, undefined> {
  const time = parseTime(rule.time);
  const lastDay = rule.ends.type === 'on' ? dayNumber(parseDate(rule.ends.date)) : Infinity;
  const count = rule.ends.type === 'after' ? rule.ends.count : Infinity;
  // A count is counted from the start, so a counted rule always walks from it (≤ 365 occurrences).
  const near = from && count === Infinity ? Math.floor(from.getTime() / 86_400_000) - 2 : undefined;
  let made = 0;
  for (const day of ruleDays(rule, near)) {
    if (made >= count || dayNumber(day) > lastDay) return;
    made++;
    const at = zonedTime(day, time, rule.timezone);
    if (!from || at >= from) yield at;
  }
}

/** Occurrences within [from, to]: the expansion job's window. */
export function occurrencesBetween(rule: RecurrenceRule, from: Date, to: Date): Date[] {
  const found: Date[] = [];
  for (const at of occurrences(rule, from)) {
    if (at > to) break;
    found.push(at);
  }
  return found;
}

/** The first occurrence at or after `from`, or null when the rule has ended. */
export function nextOccurrence(rule: RecurrenceRule, from: Date): Date | null {
  for (const at of occurrences(rule, from)) return at;
  return null;
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * The rule as an RFC 5545 RRULE (its timezone is kept alongside in the row). Stored for
 * interoperability (exports, other calendars); expansion reads the structured rule.
 */
export function toRRule(rule: RecurrenceRule): string {
  const { hour, minute } = parseTime(rule.time);
  const parts = [`FREQ=${rule.frequency.toUpperCase()}`, `INTERVAL=${String(rule.interval)}`];
  if (rule.frequency === 'weekly') {
    parts.push(`BYDAY=${(rule.weekdays ?? []).map((d) => BYDAY[d] ?? '').join(',')}`);
  }
  if (rule.frequency === 'monthly') parts.push(`BYMONTHDAY=${String(rule.monthDay)}`);
  parts.push(`BYHOUR=${String(hour)}`, `BYMINUTE=${String(minute)}`);
  if (rule.ends.type === 'after') parts.push(`COUNT=${String(rule.ends.count)}`);
  if (rule.ends.type === 'on') parts.push(`UNTIL=${rule.ends.date.replaceAll('-', '')}T235959`);
  return parts.join(';');
}

/** The first possible occurrence (startsOn at the rule's time) and the end of its last day. */
export function ruleBounds(rule: RecurrenceRule): { startsAt: Date; endsAt: Date | null } {
  const time = parseTime(rule.time);
  const startsAt = zonedTime(parseDate(rule.startsOn), time, rule.timezone);
  const endsAt =
    rule.ends.type === 'on'
      ? zonedTime(parseDate(rule.ends.date), { hour: 23, minute: 59 }, rule.timezone)
      : null;
  return { startsAt, endsAt };
}
