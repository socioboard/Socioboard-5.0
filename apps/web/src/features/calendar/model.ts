import {
  parseLocalDate,
  toLocalDate,
  wallClock,
  zonedTime,
  SCHEDULE_MIN_LEAD_MINUTES,
  SCHEDULE_MAX_AHEAD_DAYS,
  type CalendarEntry,
} from '@socioboard/contracts';

export type CalendarView = 'month' | 'week';
export type CalendarGroup = [CalendarEntry, ...CalendarEntry[]];
export interface CalendarSearch {
  view?: CalendarView | undefined;
  date?: string | undefined;
  account?: string | undefined;
  status?: CalendarEntry['status'] | undefined;
  label?: string | undefined;
  separate?: boolean | undefined;
}

/** Dates in links are calendar days, never instants in the reader's timezone. */
export function calendarDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = parseLocalDate(value);
  const normalized = new Date(Date.UTC(d.year, d.month - 1, d.day)).toISOString().slice(0, 10);
  return normalized === value && d.year >= 2000 && d.year <= 2200 ? value : undefined;
}

/** Same post and instant, including different delivery states, share one card. */
export function groupEntries(items: readonly CalendarEntry[], separate = false): CalendarGroup[] {
  const groups = new Map<string, CalendarGroup>();
  for (const item of items) {
    const key = separate ? item.targetId : `${item.postId}:${new Date(item.at).getTime()}`;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.values()].sort((a, b) => Date.parse(a[0].at) - Date.parse(b[0].at));
}

export function scheduleProblem(at: Date, now = new Date()): 'tooSoon' | 'tooFar' | null {
  if (at.getTime() < now.getTime() + SCHEDULE_MIN_LEAD_MINUTES * 60_000) return 'tooSoon';
  if (at.getTime() > now.getTime() + SCHEDULE_MAX_AHEAD_DAYS * 86_400_000) return 'tooFar';
  return null;
}

/** A month cell starts at 09:00; today starts no earlier than an hour from now. */
export function composeAt(day: string, zone: string, now = new Date()): Date {
  const at = zonedTime(parseLocalDate(day), { hour: 9, minute: 0 }, zone);
  const today = toLocalDate(wallClock(now.getTime(), zone));
  return day === today && at.getTime() < now.getTime() + 60 * 60_000
    ? new Date(Math.ceil((now.getTime() + 60 * 60_000) / 900_000) * 900_000)
    : at;
}

/** A changed target can leave this range/filter; never retain a ghost card there. */
export function belongsToRange(at: string, from: string, to: string) {
  const n = Date.parse(at);
  return n >= Date.parse(from) && n < Date.parse(to);
}
