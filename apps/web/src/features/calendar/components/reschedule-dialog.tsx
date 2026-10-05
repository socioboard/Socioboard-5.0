import {
  parseLocalDate,
  parseTime,
  toLocalDate,
  toTimeOfDay,
  wallClock,
  zonedTime,
  type CalendarEntry,
} from '@socioboard/contracts';
import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DateTimeValue,
} from '@socioboard/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { scheduleProblem } from '../model';

/** Keyboard and touch alternative to dragging: changes this account's delivery only. */
export function RescheduleDialog({
  entry,
  busy,
  close,
  move,
}: {
  entry: CalendarEntry;
  busy: boolean;
  close: () => void;
  move: (entry: CalendarEntry, at: Date) => Promise<boolean>;
}) {
  const { t } = useTranslation('calendar');
  const time = useWorkspaceTime();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const [when, setWhen] = useState<DateTimeValue>(() => {
    const w = wallClock(Date.parse(entry.at), time.timeZone);
    return { date: toLocalDate(w), time: toTimeOfDay(w) };
  });
  const at = zonedTime(parseLocalDate(when.date), parseTime(when.time), time.timeZone);
  const problem = scheduleProblem(at, now);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent closeLabel={t('close')} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('reschedule')}</DialogTitle>
          <DialogDescription>
            {t('rescheduleDescription', { account: entry.account.displayName, zone: time.zone })}
          </DialogDescription>
        </DialogHeader>
        <DateTimePicker
          value={when}
          onChange={setWhen}
          timeZone={time.timeZone}
          minDate={toLocalDate(wallClock(now.getTime(), time.timeZone))}
          maxDate={toLocalDate(wallClock(now.getTime() + 365 * 86_400_000, time.timeZone))}
          timeInvalid={problem !== null}
          timeDescribedBy="calendar-schedule-problem"
          labels={{
            previousMonth: t('previous'),
            nextMonth: t('next'),
            time: t('time'),
            today: t('today'),
          }}
        />
        <p
          id="calendar-schedule-problem"
          role={problem ? 'status' : undefined}
          className="text-danger text-xs"
        >
          {problem ? t(`errors.${problem}`) : '\u00a0'}
        </p>
        <DialogFooter>
          <Button disabled={busy} onClick={close}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            loading={busy}
            disabled={problem !== null}
            onClick={() => {
              void move(entry, at).then((ok) => {
                if (ok) close();
              });
            }}
          >
            {t('saveTime')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
