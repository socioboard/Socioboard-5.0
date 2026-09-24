/** Injectable time source so tests can control "now" (scheduling depends on it). */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export interface FixedClock extends Clock {
  set(date: Date): void;
  advance(ms: number): void;
}

export function createFixedClock(start: Date): FixedClock {
  let current = start.getTime();
  return {
    now: () => new Date(current),
    set: (date) => {
      current = date.getTime();
    },
    advance: (ms) => {
      current += ms;
    },
  };
}
