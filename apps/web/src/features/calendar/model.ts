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

/** Hovering a week column: the minute it points at, on the workspace's clock, snapped to 15. */
export const HOVER_SNAP_MINUTES = 15;
export function laneTime(day: string, fraction: number, zone: string): Date {
  const steps = (24 * 60) / HOVER_SNAP_MINUTES;
  const step = Math.min(steps - 1, Math.max(0, Math.floor(fraction * steps)));
  const minutes = step * HOVER_SNAP_MINUTES;
  return zonedTime(
    parseLocalDate(day),
    { hour: Math.floor(minutes / 60), minute: minutes % 60 },
    zone,
  );
}

export type Shortcut = 'previous' | 'next' | 'today' | 'month' | 'week' | 'new';

/**
 * The calendar's keys: ← → between periods, T today, M month, W week, N new post. Not while
 * typing, with a modifier held (browser and app shortcuts), or when the key was already used.
 */
export function shortcutOf(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  target: EventTarget | null;
}): Shortcut | null {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return null;
  // A key pressed with nothing focused comes from the document, which has no `closest`.
  const target = event.target instanceof Element ? event.target : null;
  if (
    target?.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"], [role="combobox"], [role="option"], [role="grid"]',
    )
  )
    return null;
  const keys: Record<string, Shortcut> = {
    ArrowLeft: 'previous',
    ArrowRight: 'next',
    t: 'today',
    m: 'month',
    w: 'week',
    n: 'new',
  };
  return keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] ?? null;
}

/** A horizontal swipe on the agenda: -1 back, 1 forward, null when it wasn't one. */
export function swipeOf(dx: number, dy: number): -1 | 1 | null {
  if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return null;
  return dx < 0 ? 1 : -1;
}
