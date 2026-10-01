/**
 * Wall-clock times in a timezone as UTC instants, the same on the server (queue slots, recurring
 * rules) and in the browser (the schedule picker), so both agree on what "09:00 in Lisbon" is.
 * Uses the runtime's timezone database through Intl; no date library.
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

/** A calendar day (month 1–12), whatever the timezone. */
export interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

/** The wall clock in `timezone` at an instant. */
export interface WallClock extends CalendarDay {
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
  date: CalendarDay,
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
export function addDays(date: CalendarDay, days: number): CalendarDay {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** 0 = Sunday … 6 = Saturday, for a calendar day. */
export function weekdayOf(date: CalendarDay): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

const two = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` (a `LocalDate`) for a calendar day. */
export function toLocalDate(date: CalendarDay): string {
  return `${String(date.year).padStart(4, '0')}-${two(date.month)}-${two(date.day)}`;
}

/** A `LocalDate` (`YYYY-MM-DD`) as a calendar day. */
export function parseLocalDate(value: string): CalendarDay {
  const [y, m, d] = value.split('-');
  return { year: Number(y), month: Number(m), day: Number(d) };
}

/** `HH:mm` (a `TimeOfDay`) for an hour and minute. */
export function toTimeOfDay(time: { hour: number; minute: number }): string {
  return `${two(time.hour)}:${two(time.minute)}`;
}
