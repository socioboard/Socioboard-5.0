/**
 * Wall-clock times in a timezone (queue slots, recurring rules) as UTC instants. Uses the runtime's
 * timezone database through Intl; no date library.
 *
 * Daylight-saving days (docs/backend/modules/scheduling.md, Rules): a time the clock skips moves
 * forward by the gap (02:30 on a night that jumps 02:00 → 03:00 is 03:30); a time that happens
 * twice uses the first.
 */

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string) {
  let f = formatters.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    formatters.set(timezone, f);
  }
  return f;
}

/** The wall clock in `timezone` at an instant. */
export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function wallClock(instant: number, timezone: string): WallClock {
  const parts = Object.fromEntries(
    formatter(timezone)
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: WEEKDAYS.indexOf(parts.weekday ?? ''),
  };
}

/** How far `timezone` is ahead of UTC at an instant, in ms (whole minutes). */
function offsetAt(instant: number, timezone: string): number {
  const w = wallClock(instant, timezone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
  return asUtc - (instant - (instant % 60_000));
}

const HOUR = 3_600_000;

/**
 * The instant a wall-clock time happens in `timezone` (month 1–12). Skipped times move forward by
 * the gap; repeated times use their first occurrence.
 */
export function zonedTime(
  date: { year: number; month: number; day: number },
  time: { hour: number; minute: number },
  timezone: string,
): Date {
  const local = Date.UTC(date.year, date.month - 1, date.day, time.hour, time.minute);
  // Offsets either side of any change that day (changes are at most a few hours long).
  const before = offsetAt(local - 24 * HOUR, timezone);
  const after = offsetAt(local + 24 * HOUR, timezone);
  const matches = [...new Set([before, after])]
    .map((offset) => local - offset)
    .filter((instant) => {
      const w = wallClock(instant, timezone);
      return w.hour === time.hour && w.minute === time.minute && w.day === date.day;
    })
    .sort((a, b) => a - b);
  // A repeated time: the first; a skipped time: read with the offset before the change, which
  // lands the gap's length later on the new clock.
  return new Date(matches[0] ?? local - before);
}

/** `HH:mm` → hour and minute. */
export function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':');
  return { hour: Number(h), minute: Number(m) };
}

/** The calendar day `days` after the given one (month 1–12), whatever the timezone. */
export function addDays(date: { year: number; month: number; day: number }, days: number) {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** 0 = Sunday … 6 = Saturday, for a calendar day. */
export function weekdayOf(date: { year: number; month: number; day: number }): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

/**
 * Weekly slots (weekday + HH:mm in one timezone) as instants, in order, from `from` on. Walks day
 * by day in the slots' timezone, so each slot keeps its wall-clock time across daylight saving.
 */
export function* slotTimes(
  slots: readonly { weekday: number; time: string }[],
  timezone: string,
  from: Date,
  maxDays = 371,
): Generator<Date, void, undefined> {
  if (slots.length === 0) return;
  const byDay = new Map<number, { hour: number; minute: number }[]>();
  for (const s of slots) {
    const list = byDay.get(s.weekday) ?? [];
    list.push(parseTime(s.time));
    byDay.set(s.weekday, list);
  }
  // Days counted on the slots' clock, starting from `from`'s day there.
  const start = wallClock(from.getTime(), timezone);
  for (let d = 0; d <= maxDays; d++) {
    const day = addDays(start, d);
    // Sorted and de-duplicated per day: a skipped 02:30 moves to 03:30, which may be after a
    // 03:00 slot or the same instant as a 03:30 one.
    const instants = [
      ...new Set(
        (byDay.get(weekdayOf(day)) ?? []).map((t) => zonedTime(day, t, timezone).getTime()),
      ),
    ].sort((a, b) => a - b);
    for (const at of instants) if (at >= from.getTime()) yield new Date(at);
  }
}
