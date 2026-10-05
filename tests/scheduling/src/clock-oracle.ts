// An answer to "when is HH:mm on this day in this timezone?" worked out without zonedTime: walk
// the real clock in 15-minute steps and look. It shares nothing with the code under test but the
// runtime's timezone database. Every clock change in use starts on a quarter hour, so 15-minute
// steps see each one exactly.

export const STEP = 15 * 60_000;
const DAY = 86_400_000;

export interface Day {
  year: number;
  month: number;
  day: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** The clock in `zone` at an instant, as ms since 1970 read as if it were UTC ("local ms"). */
export function localMs(instant: number, zone: string): number {
  let f = formatters.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    });
    formatters.set(zone, f);
  }
  const p: Record<string, number> = {};
  for (const part of f.formatToParts(instant)) {
    if (part.type !== 'literal') p[part.type] = Number(part.value);
  }
  return Date.UTC(p.year ?? 0, (p.month ?? 1) - 1, p.day ?? 1, p.hour ?? 0, p.minute ?? 0);
}

/** How far `zone` is ahead of UTC at an instant (ms). */
export const offsetAt = (instant: number, zone: string) =>
  localMs(instant, zone) - (instant - (instant % 60_000));

/**
 * Every instant in [from, to) where `zone`'s offset changes (the first instant on the new clock).
 * Days are scanned, then the changing day is narrowed to the quarter hour.
 */
export function changesIn(zone: string, start: number, to: number): number[] {
  // On the quarter-hour grid, where every change happens.
  const from = start - (start % STEP);
  const found: number[] = [];
  let prev = offsetAt(from, zone);
  for (let t = from + DAY; t <= to; t += DAY) {
    const now = offsetAt(t, zone);
    if (now === prev) continue;
    // Narrow to the step where it changes (at most one change a day, in practice).
    let lo = t - DAY;
    let hi = t;
    while (hi - lo > STEP) {
      const mid = lo + Math.floor((hi - lo) / 2 / STEP) * STEP;
      if (offsetAt(mid, zone) === prev) lo = mid;
      else hi = mid;
    }
    found.push(hi);
    prev = now;
  }
  return found;
}

/** The calendar day an instant falls on in `zone`. */
export function dayAt(instant: number, zone: string): Day {
  const d = new Date(localMs(instant, zone));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** Each quarter-hour instant around a day, with what `zone`'s clock reads then. */
export function walkDay(day: Day, zone: string): { at: number; local: number }[] {
  const midnight = Date.UTC(day.year, day.month - 1, day.day);
  const steps: { at: number; local: number }[] = [];
  // Every offset in use is within ±15 h.
  for (let at = midnight - 15 * 3_600_000; at <= midnight + DAY + 15 * 3_600_000; at += STEP) {
    steps.push({ at, local: localMs(at, zone) });
  }
  return steps;
}

/**
 * When `minutes` past midnight on `day` happens, from a walk: the first instant the clock shows
 * it; if the clock never shows it (skipped by a change), the jump's instant plus how far into the
 * gap it falls, which is the same as moving it forward by the gap.
 */
export function expectedInstant(
  walk: { at: number; local: number }[],
  day: Day,
  minutes: number,
): number {
  const target = Date.UTC(day.year, day.month - 1, day.day) + minutes * 60_000;
  const shown = walk.find((s) => s.local === target);
  if (shown) return shown.at;
  for (let i = 1; i < walk.length; i++) {
    const before = walk[i - 1];
    const after = walk[i];
    if (!before || !after) continue;
    // The clock would have read `before.local + STEP`; it reads `after.local` instead.
    const would = before.local + STEP;
    if (after.local > would && target >= would && target < after.local) {
      return after.at + (target - would);
    }
  }
  throw new Error(`no answer for ${JSON.stringify(day)} ${String(minutes)} min`);
}
