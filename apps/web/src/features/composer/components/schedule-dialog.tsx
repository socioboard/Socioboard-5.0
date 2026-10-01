import {
  parseLocalDate,
  SCHEDULE_MIN_LEAD_MINUTES,
  type Post,
  type Recurrence,
  type RecurrenceRuleInput,
} from '@socioboard/contracts';
import {
  Button,
  cn,
  Collapse,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Swap,
} from '@socioboard/ui';
import { CalendarClock, Repeat } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { mondayFirst, useRepeatWording, weekdayName } from '../../posts';
import {
  dateBounds,
  defaultEndDate,
  hasSeveralTimes,
  initialForm,
  instantOf,
  problemOf,
  ruleOf,
  weekdaysOf,
  type ScheduleForm,
} from '../schedule';

const INTERVALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Sunday or Monday first, as the reader's region has it. */
function weekStart(): 0 | 1 | 6 {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const first = (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay;
    return first === 7 ? 0 : first === 6 ? 6 : 1;
  } catch {
    return 1;
  }
}

export interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The post as the server has it (its schedule, if any, is where the dialog starts). */
  post: Post | undefined;
  recurrence: Recurrence | null;
  /** A repeating post's copy can't repeat on its own. */
  canRepeat: boolean;
  busy: boolean;
  onSchedule: (at: Date) => void;
  onRepeat: (rule: RecurrenceRuleInput) => void;
}

/**
 * When the post goes out (docs/frontend/areas/composer.md, "Schedule"): a day and time on the
 * workspace's clock, once or repeating.
 */
export function ScheduleDialog({ open, onOpenChange, ...props }: ScheduleDialogProps) {
  const { t } = useTranslation('composer');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" closeLabel={t('schedule.close')}>
        {/* Mounted only while open: each opening starts from the post's schedule as it is now. */}
        <ScheduleBody
          {...props}
          close={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function ScheduleBody({
  post,
  recurrence,
  canRepeat,
  busy,
  onSchedule,
  onRepeat,
  close,
}: Omit<ScheduleDialogProps, 'open' | 'onOpenChange'> & { close: () => void }) {
  const { t, i18n } = useTranslation('composer');
  const time = useWorkspaceTime();
  const describe = useRepeatWording();
  const id = useId();
  // "Too soon" is judged against the clock, which moves while the dialog is open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const [form, setForm] = useState<ScheduleForm>(() =>
    initialForm({ post, recurrence, now, timeZone: time.timeZone }),
  );
  const set = (patch: Partial<ScheduleForm>) => {
    setForm((f) => ({ ...f, ...patch }));
  };
  const changing = post?.status === 'scheduled' || recurrence?.active === true;
  const repeats = form.repeat !== 'none';
  const bounds = dateBounds(now, time.timeZone);
  const problem = problemOf(form, now, time.timeZone);
  const at = instantOf(form.when, time.timeZone);
  const day = parseLocalDate(form.when.date).day;
  const weekdays = weekdaysOf(form);
  const start = weekStart();
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => (i + start) % 7);

  const submit = () => {
    if (problem) return;
    if (repeats) onRepeat(ruleOf(form, time.timeZone));
    else onSchedule(at);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{changing ? t('schedule.titleChange') : t('schedule.title')}</DialogTitle>
        <DialogDescription>{t('schedule.description', { zone: time.zone })}</DialogDescription>
      </DialogHeader>

      <DateTimePicker
        value={form.when}
        onChange={(when) => {
          set({ when });
        }}
        timeZone={time.timeZone}
        // A repeating post keeps the day it started on, even when that's behind us.
        minDate={form.when.date < bounds.min && repeats ? form.when.date : bounds.min}
        maxDate={bounds.max}
        weekStartsOn={start}
        timeInvalid={problem === 'tooSoon' || problem === 'tooFar'}
        timeDescribedBy={`${id}-when`}
        labels={{
          previousMonth: t('schedule.previousMonth'),
          nextMonth: t('schedule.nextMonth'),
          time: t('schedule.time'),
          today: t('schedule.today'),
        }}
      />

      {canRepeat && (
        <FormField label={t('schedule.repeat.label')}>
          {(control) => (
            <Select
              value={form.repeat}
              onValueChange={(repeat) => {
                set({ repeat: repeat as ScheduleForm['repeat'] });
              }}
            >
              <SelectTrigger {...control}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['none', 'daily', 'weekly', 'monthly'] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`schedule.repeat.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      )}

      <Collapse open={repeats} className="-mx-1 shrink-0 px-1">
        <div className="flex flex-col gap-4 pb-1">
          {form.repeat !== 'none' && (
            <FormField label={t('schedule.interval.label')}>
              {(control) => (
                <Select
                  value={String(form.interval)}
                  onValueChange={(n) => {
                    set({ interval: Number(n) });
                  }}
                >
                  <SelectTrigger {...control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {t(`schedule.interval.${form.repeat as 'daily'}`, { count: n })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}

          {form.repeat === 'weekly' && (
            <div role="group" aria-labelledby={`${id}-days`} className="flex flex-col gap-1.5">
              <span id={`${id}-days`} className="text-ink-2 text-[13px] font-medium">
                {t('schedule.weekdays')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {week.map((d) => {
                  const on = weekdays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      aria-label={weekdayName(d, 'long', i18n.language)}
                      // The last day stays: a weekly post goes out on at least one.
                      aria-disabled={on && weekdays.length === 1 ? true : undefined}
                      onClick={() => {
                        if (on && weekdays.length === 1) return;
                        set({
                          weekdays: mondayFirst(
                            on ? weekdays.filter((x) => x !== d) : [...weekdays, d],
                          ),
                        });
                      }}
                      className={cn(
                        'h-9 min-w-11 cursor-pointer rounded-full px-2.5 text-[13px] font-medium',
                        'transition-[background-color,color,border-color,transform] duration-200 ease-out-soft',
                        'active:scale-95 motion-reduce:active:scale-100',
                        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                        'aria-disabled:cursor-not-allowed',
                        on
                          ? 'bg-ring text-canvas border border-transparent'
                          : 'glass-chip text-ink-2 hover:text-ink hover:border-hair-strong',
                      )}
                    >
                      {weekdayName(d, 'short', i18n.language)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {form.repeat === 'monthly' && (
            <FormField
              label={t('schedule.monthDay.label')}
              hint={
                form.monthDay === 'same' && day > 28
                  ? t('schedule.monthDay.skips', { day })
                  : undefined
              }
            >
              {(control) => (
                <Select
                  value={form.monthDay}
                  onValueChange={(monthDay) => {
                    set({ monthDay: monthDay as ScheduleForm['monthDay'] });
                  }}
                >
                  <SelectTrigger {...control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">{t('schedule.monthDay.same', { day })}</SelectItem>
                    <SelectItem value="last">{t('schedule.monthDay.last')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}

          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <FormField label={t('schedule.ends.label')}>
              {(control) => (
                <Select
                  value={form.ends}
                  onValueChange={(ends) => {
                    set({
                      ends: ends as ScheduleForm['ends'],
                      ...(ends === 'on' && !form.endDate ? { endDate: defaultEndDate(form) } : {}),
                    });
                  }}
                >
                  <SelectTrigger {...control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['never', 'on', 'after'] as const).map((e) => (
                      <SelectItem key={e} value={e}>
                        {t(`schedule.ends.${e}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            {form.ends === 'on' && (
              <FormField
                label={t('schedule.ends.date')}
                className="animate-enter"
                {...(problem === 'endsBeforeStart' || problem === 'endDateMissing'
                  ? { error: t(`schedule.problems.${problem}`) }
                  : {})}
              >
                {(control) => (
                  <Input
                    {...control}
                    type="date"
                    min={form.when.date}
                    value={form.endDate}
                    onChange={(e) => {
                      set({ endDate: e.target.value });
                    }}
                    className="cursor-text"
                  />
                )}
              </FormField>
            )}
            {form.ends === 'after' && (
              <FormField
                label={t('schedule.ends.count')}
                className="animate-enter"
                {...(problem === 'count' ? { error: t('schedule.problems.count') } : {})}
              >
                {(control) => (
                  <Input
                    {...control}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={365}
                    value={Number.isNaN(form.count) ? '' : form.count}
                    onChange={(e) => {
                      set({ count: e.target.value === '' ? Number.NaN : Number(e.target.value) });
                    }}
                  />
                )}
              </FormField>
            )}
          </div>
        </div>
      </Collapse>

      {/* What will happen, in a sentence; it changes in place as the choices do. */}
      <div
        id={`${id}-when`}
        className={cn(
          'rounded-control relative flex min-h-11 items-start gap-2.5 px-3 py-2.5 text-[13px] leading-relaxed transition-colors duration-300',
          problem === 'tooSoon' || problem === 'tooFar'
            ? 'bg-danger-tint text-danger'
            : 'bg-chip text-ink',
        )}
        role="status"
      >
        {repeats ? (
          <Repeat className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <Swap
          id={
            problem === 'tooSoon' || problem === 'tooFar'
              ? problem
              : repeats
                ? 'repeat'
                : String(at.getTime())
          }
          className="flex min-w-0 flex-col"
        >
          {problem === 'tooSoon' ? (
            t('schedule.problems.tooSoon', { count: SCHEDULE_MIN_LEAD_MINUTES })
          ) : problem === 'tooFar' ? (
            t('schedule.problems.tooFar')
          ) : repeats ? (
            <span>{describe(ruleOf(form, time.timeZone))}</span>
          ) : (
            <>
              <span className="font-medium">
                {t('schedule.goesOut', { time: time.format(at, 'long') })}
              </span>
              {time.differs && (
                <span className="text-ink-3 text-xs">
                  {t('schedule.yourTime', { time: time.own(at, 'long') })}
                </span>
              )}
            </>
          )}
        </Swap>
      </div>
      {!repeats && hasSeveralTimes(post) && (
        <p className="text-ink-3 text-xs leading-relaxed">{t('schedule.severalTimes')}</p>
      )}

      <DialogFooter>
        <Button onClick={close} disabled={busy}>
          {t('schedule.cancel')}
        </Button>
        <Button variant="primary" onClick={submit} disabled={problem !== null} loading={busy}>
          {repeats ? t('schedule.confirmRepeat') : t('schedule.confirm')}
        </Button>
      </DialogFooter>
    </>
  );
}
