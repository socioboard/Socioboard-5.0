import { QUEUE_MAX_SLOTS } from '@socioboard/contracts';
import { describe, expect, it } from 'vitest';

import {
  addSlot,
  copyDay,
  preset,
  removeSlot,
  sameSlots,
  sortSlots,
  timesOn,
  tooMany,
} from '../posting-times';

const s = (weekday: number, time: string) => ({ weekday, time });

describe('posting times', () => {
  it('are kept Monday first, by time, without duplicates', () => {
    expect(sortSlots([s(0, '09:00'), s(1, '15:00'), s(1, '09:00'), s(1, '09:00')])).toEqual([
      s(1, '09:00'),
      s(1, '15:00'),
      s(0, '09:00'),
    ]);
  });

  it('adding a time a day already has changes nothing; removing takes only that one', () => {
    const slots = [s(1, '09:00'), s(2, '09:00')];
    expect(addSlot(slots, 1, '09:00')).toEqual(slots);
    expect(addSlot(slots, 1, '08:30')).toEqual([s(1, '08:30'), s(1, '09:00'), s(2, '09:00')]);
    expect(removeSlot(slots, 1, '09:00')).toEqual([s(2, '09:00')]);
    expect(timesOn(addSlot(slots, 1, '18:00'), 1)).toEqual(['09:00', '18:00']);
  });

  it('copying a day replaces the other days’ times with its own, and leaves the rest', () => {
    const slots = [s(1, '09:00'), s(1, '15:00'), s(2, '12:00'), s(6, '11:00')];
    expect(copyDay(slots, 1, [1, 2, 3])).toEqual([
      s(1, '09:00'),
      s(1, '15:00'),
      s(2, '09:00'),
      s(2, '15:00'),
      s(3, '09:00'),
      s(3, '15:00'),
      s(6, '11:00'),
    ]);
    // An empty day copied clears the others.
    expect(copyDay(slots, 4, [1, 2])).toEqual([s(6, '11:00')]);
  });

  it('presets: weekdays at 09:00 and 15:00, every day at 10:00, or none', () => {
    expect(preset('weekdays')).toHaveLength(10);
    expect(timesOn(preset('weekdays'), 3)).toEqual(['09:00', '15:00']);
    expect(timesOn(preset('weekdays'), 6)).toEqual([]);
    expect(preset('everyDay')).toHaveLength(7);
    expect(timesOn(preset('everyDay'), 0)).toEqual(['10:00']);
    expect(preset('clear')).toEqual([]);
  });

  it('knows when there are more than the server takes, and when nothing changed', () => {
    const many = Array.from({ length: QUEUE_MAX_SLOTS + 1 }, (_, i) =>
      s(i % 7, `${String(Math.floor(i / 7)).padStart(2, '0')}:00`),
    );
    expect(tooMany(many)).toBe(true);
    expect(tooMany(many.slice(1))).toBe(false);
    expect(sameSlots([s(1, '09:00'), s(2, '09:00')], [s(2, '09:00'), s(1, '09:00')])).toBe(true);
    expect(sameSlots([s(1, '09:00')], [s(1, '09:30')])).toBe(false);
    expect(sameSlots([s(1, '09:00')], [])).toBe(false);
  });
});
