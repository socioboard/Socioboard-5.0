import { QUEUE_MAX_SLOTS, type QueueSlot } from '@socioboard/contracts';

/**
 * An account's weekly posting times, as the editor changes them (docs/frontend/areas/accounts.md).
 * Always sorted by weekday (Monday first, as people read a week) then time, and never the same
 * weekday and time twice, so what is sent is what the server keeps.
 */

/** Monday first. */
export const WEEK = [1, 2, 3, 4, 5, 6, 0] as const;
export const WEEKDAYS = [1, 2, 3, 4, 5] as const;

const order = (weekday: number) => (weekday + 6) % 7;

export function sortSlots(slots: readonly QueueSlot[]): QueueSlot[] {
  const seen = new Set<string>();
  return [...slots]
    .filter((s) => {
      const key = `${String(s.weekday)} ${s.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => order(a.weekday) - order(b.weekday) || a.time.localeCompare(b.time));
}

export const timesOn = (slots: readonly QueueSlot[], weekday: number) =>
  slots.filter((s) => s.weekday === weekday).map((s) => s.time);

/** Adds a time to a day; a time the day already has changes nothing. */
export function addSlot(slots: readonly QueueSlot[], weekday: number, time: string): QueueSlot[] {
  return sortSlots([...slots, { weekday, time }]);
}

export function removeSlot(slots: readonly QueueSlot[], weekday: number, time: string) {
  return slots.filter((s) => !(s.weekday === weekday && s.time === time));
}

/** The other days get exactly this day's times (their own are replaced). */
export function copyDay(
  slots: readonly QueueSlot[],
  from: number,
  to: readonly number[],
): QueueSlot[] {
  const times = timesOn(slots, from);
  const targets = to.filter((d) => d !== from);
  return sortSlots([
    ...slots.filter((s) => !targets.includes(s.weekday)),
    ...targets.flatMap((weekday) => times.map((time) => ({ weekday, time }))),
  ]);
}

export type Preset = 'weekdays' | 'everyDay' | 'clear';

/** Starting points: weekdays at 09:00 and 15:00 (the sample accounts' times), or every day. */
export function preset(name: Preset): QueueSlot[] {
  if (name === 'clear') return [];
  const days = name === 'weekdays' ? WEEKDAYS : WEEK;
  const times = name === 'weekdays' ? ['09:00', '15:00'] : ['10:00'];
  return sortSlots(days.flatMap((weekday) => times.map((time) => ({ weekday, time }))));
}

/** More than the server takes (20 a day across the week). */
export const tooMany = (slots: readonly QueueSlot[]) => slots.length > QUEUE_MAX_SLOTS;

/** The same times, whatever order they were given in. */
export function sameSlots(a: readonly QueueSlot[], b: readonly QueueSlot[]) {
  const x = sortSlots(a);
  const y = sortSlots(b);
  return (
    x.length === y.length && x.every((s, i) => s.weekday === y[i]?.weekday && s.time === y[i].time)
  );
}
