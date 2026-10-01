import {
  addDays,
  parseLocalDate,
  toLocalDate,
  wallClock,
  weekdayOf,
  type CalendarDay,
} from '@socioboard/contracts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '../cn';
import { motion, springs, Swap } from '../motion';
import { Input, Label } from './form';

/** A day and a time on the wall clock of the picker's timezone. */
export interface DateTimeValue {
  /** `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm`, 24-hour. */
  time: string;
}

export interface DateTimePickerLabels {
  previousMonth: string;
  nextMonth: string;
  time: string;
  today: string;
}

const DEFAULT_LABELS: DateTimePickerLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  time: 'Time',
  today: 'Today',
};

export interface DateTimePickerProps {
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  /**
   * The timezone the day and time are in (IANA name). It decides which day is today; turning the
   * value into an instant is the caller's job (`zonedTime` from the contracts).
   */
  timeZone: string;
  /** First and last day that can be picked (`YYYY-MM-DD`). */
  minDate?: string;
  maxDate?: string;
  /** For month and weekday names; the browser's language when left out. */
  locale?: string | undefined;
  /** 0 = Sunday, 1 = Monday (the default), 6 = Saturday. */
  weekStartsOn?: 0 | 1 | 6;
  /** Marks the time field invalid (e.g. a time that has already passed). */
  timeInvalid?: boolean;
  /** Describes the time field (the id of an error or hint shown by the caller). */
  timeDescribedBy?: string | undefined;
  labels?: Partial<DateTimePickerLabels>;
  className?: string;
}

const utc = (d: CalendarDay) => Date.UTC(d.year, d.month - 1, d.day);
const monthOf = (date: string) => date.slice(0, 7);

/**
 * A month to pick a day from, with a time field under it. The value is a wall-clock day and time
 * in one timezone (the workspace's), not the browser's. Arrow keys move by day and week, Home and
 * End to the ends of the week, Page Up and Page Down by month; days outside the range are off.
 */
export function DateTimePicker({
  value,
  onChange,
  timeZone,
  minDate,
  maxDate,
  locale,
  weekStartsOn = 1,
  timeInvalid = false,
  timeDescribedBy,
  labels,
  className,
}: DateTimePickerProps) {
  const words = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  // Today, as of when the picker opened (it's open for a moment, not across midnight).
  const [openedAt] = useState(() => Date.now());
  const today = toLocalDate(wallClock(openedAt, timeZone));
  // The month on screen, and the day the keyboard is on; both follow the value when it changes
  // from outside.
  const [cursor, setCursor] = useState(value.date);
  const [view, setView] = useState(monthOf(value.date));
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [seen, setSeen] = useState(value.date);
  if (seen !== value.date) {
    setSeen(value.date);
    setCursor(value.date);
    setView(monthOf(value.date));
  }
  const grid = useRef<HTMLDivElement>(null);
  // After a key moved the cursor: focus its day once it's drawn (it may be in another month).
  const [focusTick, setFocusTick] = useState(0);
  useEffect(() => {
    if (focusTick === 0) return;
    // The month that's sliding away is still in the page (inert): skip its copy of the day.
    const days = grid.current?.querySelectorAll<HTMLButtonElement>(`button[data-date="${cursor}"]`);
    [...(days ?? [])].find((d) => !d.closest('[inert]'))?.focus();
    // Only a key press moves focus, not every change of the cursor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTick]);

  const inRange = (date: string) =>
    (minDate === undefined || date >= minDate) && (maxDate === undefined || date <= maxDate);
  const clamp = (date: string) =>
    minDate !== undefined && date < minDate
      ? minDate
      : maxDate !== undefined && date > maxDate
        ? maxDate
        : date;

  const showMonth = (month: string) => {
    if (month === view) return;
    setDirection(month > view ? 1 : -1);
    setView(month);
  };
  const [viewYear, viewMonth] = view.split('-').map(Number) as [number, number];
  const first: CalendarDay = { year: viewYear, month: viewMonth, day: 1 };
  // Six weeks, always: the picker keeps its height from month to month.
  const lead = (weekdayOf(first) - weekStartsOn + 7) % 7;
  const days = Array.from({ length: 42 }, (_, i) => toLocalDate(addDays(first, i - lead)));
  const lastOfPrevious = toLocalDate(addDays(first, -1));
  const firstOfNext = toLocalDate({
    year: viewMonth === 12 ? viewYear + 1 : viewYear,
    month: viewMonth === 12 ? 1 : viewMonth + 1,
    day: 1,
  });

  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
  const title = format({ month: 'long', year: 'numeric' }).format(utc(first));
  const dayName = format({ dateStyle: 'full' });
  const weekdayShort = format({ weekday: 'short' });
  const weekdayLong = format({ weekday: 'long' });

  // The day Tab lands on: the cursor when its month is showing, else the first day that can be
  // picked there.
  const tabStop = days.includes(cursor)
    ? cursor
    : (days.find((d) => monthOf(d) === view && inRange(d)) ?? null);

  const moveTo = (date: string) => {
    const next = clamp(date);
    setCursor(next);
    showMonth(monthOf(next));
    setFocusTick((n) => n + 1);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const from = parseLocalDate(cursor);
    const column = (weekdayOf(from) - weekStartsOn + 7) % 7;
    const moves: Record<string, () => CalendarDay> = {
      ArrowLeft: () => addDays(from, -1),
      ArrowRight: () => addDays(from, 1),
      ArrowUp: () => addDays(from, -7),
      ArrowDown: () => addDays(from, 7),
      Home: () => addDays(from, -column),
      End: () => addDays(from, 6 - column),
      // The same day a month away, or that month's last day (31 January → 28 February).
      PageUp: () => sameDay(from, -1),
      PageDown: () => sameDay(from, 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    moveTo(toLocalDate(move()));
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${id}-title`} aria-live="polite" className="text-ink text-sm font-semibold">
          {title}
        </h3>
        <div className="flex items-center gap-1">
          <MonthButton
            label={words.previousMonth}
            disabled={minDate !== undefined && lastOfPrevious < minDate}
            onClick={() => {
              showMonth(monthOf(lastOfPrevious));
            }}
          >
            <ChevronLeft aria-hidden="true" />
          </MonthButton>
          <MonthButton
            label={words.nextMonth}
            disabled={maxDate !== undefined && firstOfNext > maxDate}
            onClick={() => {
              showMonth(monthOf(firstOfNext));
            }}
          >
            <ChevronRight aria-hidden="true" />
          </MonthButton>
        </div>
      </div>
      <div
        ref={grid}
        role="grid"
        aria-labelledby={`${id}-title`}
        onKeyDown={onKeyDown}
        className="relative overflow-hidden"
      >
        <div role="row" className="grid grid-cols-7 justify-items-center pb-1">
          {days.slice(0, 7).map((d) => (
            <span
              key={d}
              role="columnheader"
              aria-label={weekdayLong.format(utc(parseLocalDate(d)))}
              className="text-ink-3 flex h-7 items-center text-[11px] font-medium"
            >
              {weekdayShort.format(utc(parseLocalDate(d)))}
            </span>
          ))}
        </div>
        {/* A month slides in from the side it lies on. */}
        <Swap id={view} direction={direction} className="flex flex-col gap-0.5">
          {[0, 1, 2, 3, 4, 5].map((week) => (
            <div key={week} role="row" className="grid grid-cols-7 justify-items-center">
              {days.slice(week * 7, week * 7 + 7).map((d) => {
                const selected = d === value.date;
                const outside = monthOf(d) !== view;
                const isToday = d === today;
                return (
                  <div key={d} role="gridcell" aria-selected={selected}>
                    <button
                      type="button"
                      data-date={d}
                      tabIndex={d === tabStop ? 0 : -1}
                      disabled={!inRange(d)}
                      aria-label={
                        isToday
                          ? `${dayName.format(utc(parseLocalDate(d)))}, ${words.today}`
                          : dayName.format(utc(parseLocalDate(d)))
                      }
                      {...(isToday ? { 'aria-current': 'date' as const } : {})}
                      onClick={() => {
                        setCursor(d);
                        showMonth(monthOf(d));
                        onChange({ ...value, date: d });
                      }}
                      className={cn(
                        'relative isolate flex size-9 cursor-pointer items-center justify-center rounded-full text-[13px] tabular-nums',
                        'transition-[color,background-color,transform] duration-150 ease-out-soft',
                        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                        'not-disabled:active:scale-90 motion-reduce:active:scale-100',
                        'disabled:cursor-not-allowed disabled:opacity-35',
                        selected
                          ? 'text-canvas font-semibold'
                          : cn(
                              'not-disabled:hover:bg-chip',
                              outside ? 'text-ink-3' : 'text-ink',
                              isToday && 'font-semibold',
                            ),
                      )}
                    >
                      {selected && (
                        // The mark glides from the day picked before, within a month.
                        <motion.span
                          layoutId={`${id}-${view}`}
                          aria-hidden="true"
                          className="bg-ring absolute inset-0 -z-10 rounded-full shadow-sm"
                          transition={springs.snappy}
                        />
                      )}
                      {Number(d.slice(8))}
                      {isToday && !selected && (
                        <span
                          aria-hidden="true"
                          className="bg-accent absolute bottom-1 size-1 rounded-full"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </Swap>
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor={`${id}-time`}>{words.time}</Label>
        <Input
          id={`${id}-time`}
          type="time"
          required
          value={value.time}
          {...(timeInvalid ? { 'aria-invalid': true } : {})}
          {...(timeDescribedBy ? { 'aria-describedby': timeDescribedBy } : {})}
          onChange={(e) => {
            // Cleared (a half-typed time) reads as empty: keep the last whole time.
            if (e.target.value) onChange({ ...value, time: e.target.value.slice(0, 5) });
          }}
          className="h-9 w-32 cursor-text tabular-nums"
        />
      </div>
    </div>
  );
}

/** The same day `months` away, or that month's last day when it's shorter. */
function sameDay(from: CalendarDay, months: number): CalendarDay {
  const first = new Date(Date.UTC(from.year, from.month - 1 + months, 1));
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth() + 1;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(from.day, last) };
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'text-ink-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg [&_svg]:size-4',
        'transition-[background-color,color,transform] duration-150 ease-out-soft',
        'not-disabled:hover:bg-chip not-disabled:hover:text-ink not-disabled:active:scale-90',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      {children}
    </button>
  );
}
