import FullCalendar, {
  type CalendarRef,
  type DateClickInfo,
  type DatesSetInfo,
  type EventDisplayInfo,
  type EventDropInfo,
  type EventHoveringInfo,
  type EventInput,
} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import listPlugin from '@fullcalendar/react/list';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import themePlugin from '@fullcalendar/react/themes/classic';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import { toLocalDate, wallClock, type CalendarEntry } from '@socioboard/contracts';
import { CalendarEventCard, cn } from '@socioboard/ui';
import { Plus } from 'lucide-react';
import { memo, useCallback, useMemo, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { formatLocalDate } from '../../../lib/time';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import type { CalendarGroup, OpenSlot } from '../model';

const PLUGINS = [themePlugin, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin];

/** What the page does when the calendar reports something; read when it happens. */
export interface GridHandlers {
  datesSet: (info: DatesSetInfo) => void;
  dateClick: (info: DateClickInfo) => void;
  drop: (info: EventDropInfo) => void;
  allow: (start: Date) => boolean;
  dragStart: () => void;
  dragStop: () => void;
  enter: (info: EventHoveringInfo) => void;
  leave: () => void;
  open: (entries: CalendarGroup) => void;
  openSlot: (slot: OpenSlot) => void;
  createOn: (day: string) => void;
  lane: (el: HTMLElement, day: string | null) => void;
}

const entriesOf = (info: EventDisplayInfo): CalendarGroup =>
  info.event.extendedProps.entries as CalendarGroup;
const slotOf = (props: Record<string, unknown>) => props.slot as OpenSlot | undefined;

/**
 * FullCalendar, kept apart from the page so it re-renders only when what it shows changes (the
 * posts, the view, the date, the timezone, permissions). Re-rendering it cancels a drag under
 * way, and the page re-renders often (a refresh in the background, the clock, a hover). The page's
 * handlers are reached through `handlers`, so passing new ones never re-renders it.
 */
export const CalendarGrid = memo(function CalendarGrid({
  calendarRef,
  handlers,
  events,
  initialView,
  initialDate,
  weekTitle,
  height,
  editable,
  compactCards,
  canCreate,
  statusLabels,
}: {
  calendarRef: RefObject<CalendarRef | null>;
  handlers: RefObject<GridHandlers | null>;
  events: EventInput[];
  initialView: string;
  initialDate: string;
  weekTitle: boolean;
  height: number | 'auto';
  editable: boolean;
  compactCards: boolean;
  canCreate: boolean;
  statusLabels: Record<CalendarEntry['status'], string>;
}) {
  const { t } = useTranslation('calendar');
  const time = useWorkspaceTime();
  const on = useMemo(
    () => ({
      datesSet: (info: DatesSetInfo) => {
        handlers.current?.datesSet(info);
      },
      dateClick: (info: DateClickInfo) => {
        handlers.current?.dateClick(info);
      },
      drop: (info: EventDropInfo) => {
        handlers.current?.drop(info);
      },
      allow: (info: { start: Date }) => handlers.current?.allow(info.start) ?? false,
      dragStart: () => {
        handlers.current?.dragStart();
      },
      dragStop: () => {
        handlers.current?.dragStop();
      },
      enter: (info: EventHoveringInfo) => {
        if (!slotOf(info.event.extendedProps)) handlers.current?.enter(info);
      },
      leave: () => {
        handlers.current?.leave();
      },
      click: (info: { jsEvent: MouseEvent; event: { extendedProps: Record<string, unknown> } }) => {
        info.jsEvent.preventDefault();
        const slot = slotOf(info.event.extendedProps);
        if (slot) handlers.current?.openSlot(slot);
        else handlers.current?.open(info.event.extendedProps.entries as CalendarGroup);
      },
    }),
    [handlers],
  );

  const eventLabel = useCallback(
    (entries: CalendarGroup) => {
      const first = entries[0];
      return t('eventLabel', {
        text: first.text || t('noText'),
        accounts: entries.map((e) => e.account.displayName).join(', '),
        time: time.format(first.at, 'long'),
        status: [...new Set(entries.map((e) => statusLabels[e.status]))].join(', '),
      });
    },
    [t, time, statusLabels],
  );
  const dayOf = useCallback(
    (date: Date) => toLocalDate(wallClock(date.getTime(), time.timeZone)),
    [time.timeZone],
  );

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={PLUGINS}
      initialView={initialView}
      initialDate={initialDate}
      timeZone={time.timeZone}
      headerToolbar={false}
      firstDay={1}
      titleFormat={{ year: 'numeric', month: 'long', ...(weekTitle ? { day: 'numeric' } : {}) }}
      height={height}
      fixedWeekCount
      dayMaxEvents={3}
      allDaySlot={false}
      slotDuration="00:30:00"
      slotLaneClass="sb-calendar-slot"
      snapDuration="00:15:00"
      scrollTime="08:00:00"
      nowIndicator
      eventDisplay="block"
      events={events}
      editable={editable}
      eventDurationEditable={false}
      eventMinHeight={56}
      eventInteractive
      eventLongPressDelay={350}
      eventDragMinDistance={8}
      dragRevertDuration={150}
      datesSet={on.datesSet}
      dateClick={on.dateClick}
      eventDrop={on.drop}
      eventAllow={on.allow}
      eventDragStart={on.dragStart}
      eventDragStop={on.dragStop}
      eventMouseEnter={on.enter}
      eventMouseLeave={on.leave}
      eventClick={on.click}
      dayLaneClass={(info) =>
        cn(
          'sb-calendar-lane',
          info.isPast && 'sb-calendar-past',
          info.isToday && 'sb-calendar-today-lane',
        )
      }
      dayLaneDidMount={(info) => {
        const day = dayOf(info.date);
        info.el.dataset.date = day;
        handlers.current?.lane(info.el, day);
      }}
      dayLaneWillUnmount={(info) => {
        handlers.current?.lane(info.el, null);
      }}
      nowIndicatorHeaderContent={(info) => (
        <span className="sb-calendar-now-label">{time.format(info.date, 'time')}</span>
      )}
      eventContent={(info) => {
        const slot = slotOf(info.event.extendedProps);
        if (slot) {
          const names = slot.accounts.map((a) => a.name).join(', ');
          return (
            <span
              className="sb-calendar-slot-card"
              aria-label={t('writeForSlot', {
                time: time.format(slot.at, 'long'),
                accounts: names,
              })}
            >
              <Plus className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {time.format(slot.at, 'time')} · {names}
              </span>
            </span>
          );
        }
        return (
          <>
            <span className="sr-only">{eventLabel(entriesOf(info))}</span>
            <div aria-hidden="true" className="min-w-0 flex-1">
              <CalendarEventCard
                entries={entriesOf(info)}
                time={time.format(entriesOf(info)[0].at, 'time')}
                noText={t('noText')}
                statusLabels={statusLabels}
                compact={compactCards}
              />
            </div>
          </>
        );
      }}
      eventClass={(info) =>
        slotOf(info.event.extendedProps)
          ? 'sb-calendar-open-slot'
          : cn(
              'sb-calendar-event',
              `sb-calendar-event--${entriesOf(info)[0].status}`,
              info.isMirror && 'sb-calendar-event--lifted',
              info.isDragging && !info.isMirror && 'sb-calendar-event--origin',
              info.isPast && 'sb-calendar-event--past',
            )
      }
      eventDidMount={(info) => {
        const slot = slotOf(info.event.extendedProps);
        if (slot) info.el.setAttribute('data-open-slot', slot.at);
        else info.el.setAttribute('data-calendar-target', info.event.id);
      }}
      dayCellClass={(info) =>
        cn(
          'sb-calendar-day',
          info.isToday && 'sb-calendar-today',
          info.isPast && 'sb-calendar-past',
        )
      }
      dayCellTopInnerClass="sb-calendar-date-control"
      dayCellDidMount={(info) => {
        // FullCalendar hides its decorative date label; ours contains a compose button.
        if (canCreate)
          info.el.querySelector('.sb-calendar-date-control')?.removeAttribute('aria-hidden');
      }}
      dayCellTopContent={(info) => {
        const day = dayOf(info.date);
        return canCreate ? (
          <button
            type="button"
            className="sb-calendar-day-number"
            aria-label={t('createOn', { date: formatLocalDate(day) })}
            aria-current={info.isToday ? 'date' : undefined}
            onClick={(event) => {
              event.stopPropagation();
              handlers.current?.createOn(day);
            }}
          >
            {!info.isPast && <Plus className="sb-calendar-add" aria-hidden="true" />}
            {info.dayNumberText}
          </button>
        ) : (
          <span className="sb-calendar-day-number" aria-current={info.isToday ? 'date' : undefined}>
            {info.dayNumberText}
          </span>
        );
      }}
      dayHeaderClass="sb-calendar-heading"
      noEventsContent={t('emptyBody')}
    />
  );
});
