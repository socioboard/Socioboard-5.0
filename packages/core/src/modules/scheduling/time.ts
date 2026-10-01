/**
 * Queue slots as instants. The wall-clock maths (`wallClock`, `zonedTime` and friends) lives in
 * the contracts, so the browser's schedule picker and the server agree; it is re-exported here for
 * the scheduling module.
 */
import { addDays, parseTime, wallClock, weekdayOf, zonedTime } from '@socioboard/contracts';

export {
  addDays,
  parseTime,
  wallClock,
  weekdayOf,
  zonedTime,
  type WallClock,
} from '@socioboard/contracts';

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
