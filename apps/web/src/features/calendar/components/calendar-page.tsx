import FullCalendar, {
  type CalendarRef,
  type DatesSetInfo,
  type EventDisplayInfo,
  type EventDropInfo,
  type EventInput,
  type DateClickInfo,
} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import listPlugin from '@fullcalendar/react/list';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import themePlugin from '@fullcalendar/react/themes/classic';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import {
  addDays,
  toLocalDate,
  wallClock,
  parseLocalDate,
  type CalendarEntry,
} from '@socioboard/contracts';
import {
  Banner,
  Button,
  CalendarEventCard,
  cn,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Tooltip,
  motion,
  springs,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { formatLocalDate } from '../../../lib/time';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery } from '../../accounts';
import { GettingStarted } from '../../onboarding';
import { labelsQuery } from '../../posts';
import { calendarQuery } from '../api';
import {
  belongsToRange,
  composeAt,
  groupEntries,
  scheduleProblem,
  type CalendarSearch,
  type CalendarGroup,
} from '../model';
import { useReschedule } from '../use-reschedule';
import { PostPreview } from './post-preview';
import { RescheduleDialog } from './reschedule-dialog';
import './calendar.css';

const PLUGINS = [themePlugin, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin];
const STATUSES = [
  'scheduled',
  'publishing',
  'published',
  'failed',
  'pending',
  'cancelled',
] as const;

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => {
      setMobile(media.matches);
    };
    media.addEventListener('change', update);
    return () => {
      media.removeEventListener('change', update);
    };
  }, []);
  return mobile;
}

/** P2-F2: one workspace clock, grouped deliveries, and a single-account move with conflict checks. */
export function CalendarPage({
  search,
  onSearchChange,
}: {
  search: CalendarSearch;
  onSearchChange: (patch: Partial<CalendarSearch>) => void;
}) {
  const { t } = useTranslation('calendar');
  const { t: postT } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const time = useWorkspaceTime();
  const can = useCan();
  const navigate = useNavigate();
  const calendar = useRef<CalendarRef>(null);
  const mobile = useMobile();
  const view = search.view ?? 'month';
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const today = toLocalDate(wallClock(now, time.timeZone));
  const date = search.date ?? today;
  const actualView = mobile
    ? view === 'week'
      ? 'listWeek'
      : 'listMonth'
    : view === 'week'
      ? 'timeGridWeek'
      : 'dayGridMonth';
  const [period, setPeriod] = useState<{ from: string; to: string; title: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<CalendarEntry | null>(null);
  const { moves, move } = useReschedule();
  const accounts = useQuery(accountsQuery(workspace.id));
  const labels = useQuery(labelsQuery(workspace.id));
  const result = useQuery({
    ...calendarQuery(workspace.id, {
      from: period?.from ?? new Date(now).toISOString(),
      to: period?.to ?? new Date(now + 86_400_000).toISOString(),
      ...(search.account ? { accountId: [search.account] } : {}),
      ...(search.status ? { status: [search.status] } : {}),
      ...(search.label ? { labelId: search.label } : {}),
    }),
    enabled: period !== null,
  });
  const statusLabels = useMemo(
    () =>
      Object.fromEntries(STATUSES.map((s) => [s, postT(`status.${s}`)])) as Record<
        CalendarEntry['status'],
        string
      >,
    [postT],
  );
  const datesSet = useCallback((info: DatesSetInfo) => {
    const next = {
      from: info.start.toISOString(),
      to: info.end.toISOString(),
      title: info.view.title,
    };
    setPeriod((old) =>
      old?.from === next.from && old.to === next.to && old.title === next.title ? old : next,
    );
  }, []);
  useEffect(() => {
    const api = calendar.current?.getApi();
    api?.changeView(actualView, date);
    if (actualView === 'timeGridWeek') api?.scrollToTime('08:00:00');
  }, [actualView, date]);
  const groups = useMemo(
    () =>
      groupEntries(
        (result.data?.items ?? []).flatMap((item) => {
          const at = moves.get(item.targetId);
          if (!at) return [item];
          return period && belongsToRange(at, period.from, period.to) ? [{ ...item, at }] : [];
        }),
        search.separate,
      ),
    [result.data, moves, period, search.separate],
  );
  const events = useMemo<EventInput[]>(
    () =>
      groups.map((entries) => {
        const first = entries[0];
        return {
          id: first.targetId,
          title: first.text || t('noText'),
          start: first.at,
          startEditable:
            entries.length === 1 &&
            first.status === 'scheduled' &&
            can('posts:publish') &&
            !moves.has(first.targetId),
          durationEditable: false,
          extendedProps: { entries },
        };
      }),
    [groups, can, moves, t],
  );
  const entriesOf = (info: EventDisplayInfo): CalendarGroup =>
    info.event.extendedProps.entries as CalendarGroup;
  const eventLabel = (entries: CalendarGroup) => {
    const first = entries[0];
    return t('eventLabel', {
      text: first.text || t('noText'),
      accounts: entries.map((e) => e.account.displayName).join(', '),
      time: time.format(first.at, 'long'),
      status: [...new Set(entries.map((e) => statusLabels[e.status]))].join(', '),
    });
  };
  const drop = (info: EventDropInfo) => {
    const entries = info.oldEvent.extendedProps.entries as CalendarEntry[];
    const first = entries[0];
    const at = info.event.start;
    // The controlled events prop owns the optimistic move and rollback, not a vendor event copy.
    info.revert();
    if (entries.length === 1 && first && at && can('posts:publish')) void move(first, at);
  };
  const create = (at: Date) => {
    if (!can('posts:create')) return;
    void navigate({
      to: '/w/$slug/compose/{-$postId}',
      params: { slug: workspace.slug, postId: undefined },
      // A day or slot already past still opens a new post, but proposes no time for it.
      search: scheduleProblem(at) === 'tooSoon' ? {} : { at: at.toISOString() },
    });
  };
  const dateClick = (info: DateClickInfo) => {
    create(info.allDay ? composeAt(info.dateStr.slice(0, 10), time.timeZone) : info.date);
  };
  const shift = (direction: -1 | 1) => {
    const d = parseLocalDate(date);
    const next =
      view === 'week'
        ? toLocalDate(addDays(d, direction * 7))
        : new Date(Date.UTC(d.year, d.month - 1 + direction, 1)).toISOString().slice(0, 10);
    onSearchChange({ date: next });
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('title')}
        actions={
          can('posts:create') && (
            <Button asChild variant="primary" size="sm">
              <Link
                to="/w/$slug/compose/{-$postId}"
                params={{ slug: workspace.slug, postId: undefined }}
              >
                <Plus aria-hidden="true" />
                {t('newPost')}
              </Link>
            </Button>
          )
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 sm:px-5">
        <GettingStarted />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={t('previous')}
              onClick={() => {
                shift(-1);
              }}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={t('next')}
              onClick={() => {
                shift(1);
              }}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onSearchChange({ date: today });
              }}
            >
              {t('today')}
            </Button>
          </div>
          <h2
            className="text-ink min-w-0 text-base font-semibold tracking-tight"
            aria-live="polite"
          >
            {period?.title}
          </h2>
          <span className="text-ink-3 text-xs" title={time.timeZone}>
            {time.zone}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('refresh')}
              disabled={result.isFetching}
              onClick={() => {
                void result.refetch();
                void accounts.refetch();
                void labels.refetch();
              }}
            >
              <RefreshCw
                className={cn('size-4', result.isFetching && !result.isPending && 'animate-spin')}
                aria-hidden="true"
              />
            </Button>
            <div
              className="glass-chip relative flex rounded-control p-1"
              role="group"
              aria-label={t('views')}
            >
              {(['month', 'week'] as const).map((v) => (
                <Button
                  key={v}
                  variant="ghost"
                  size="sm"
                  aria-pressed={view === v}
                  className="relative isolate"
                  onClick={() => {
                    onSearchChange({ view: v });
                  }}
                >
                  {view === v && (
                    <motion.span
                      layoutId={`calendar-view-${workspace.id}`}
                      className="bg-chip border-hair absolute inset-0 -z-10 rounded-[7px] border shadow-sm"
                      transition={springs.snappy}
                    />
                  )}
                  {t(v)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter
            value={search.account}
            label={t('accounts')}
            all={t('allAccounts')}
            options={(accounts.data ?? []).map((a) => ({ value: a.id, label: a.displayName }))}
            onChange={(account) => {
              onSearchChange({ account });
            }}
          />
          <Filter
            value={search.status}
            label={t('status')}
            all={t('allStatuses')}
            options={STATUSES.map((s) => ({ value: s, label: statusLabels[s] }))}
            onChange={(status) => {
              onSearchChange({ status: status as CalendarSearch['status'] });
            }}
          />
          <Filter
            value={search.label}
            label={t('label')}
            all={t('allLabels')}
            options={(labels.data ?? []).map((l) => ({ value: l.id, label: l.name }))}
            onChange={(label) => {
              onSearchChange({ label });
            }}
          />
          <Tooltip content={t('separateHint')}>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-ink-2">
              <Switch
                aria-label={t('separate')}
                checked={search.separate ?? false}
                onCheckedChange={(separate) => {
                  onSearchChange({ separate: separate || undefined });
                }}
              />
              {t('separate')}
            </label>
          </Tooltip>
        </div>
        {(accounts.isError || labels.isError) && <Banner tone="warning">{t('filterError')}</Banner>}
        {result.data?.truncated && <Banner tone="warning">{t('truncated')}</Banner>}
        {result.isError && (
          <Banner
            tone="warning"
            action={
              <Button size="sm" onClick={() => void result.refetch()}>
                {t('retry')}
              </Button>
            }
          >
            {result.data ? t('stale') : t('loadError')}
          </Banner>
        )}
        {!mobile && !result.isPending && !result.isError && result.data.items.length === 0 && (
          <p className="text-ink-3 flex items-center gap-2 text-[13px]">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            {t('emptyBody')}
          </p>
        )}
        {result.isPending && (
          <div role="status" aria-label={t('loading')}>
            <Skeleton className="h-1 w-full" />
          </div>
        )}
        <section
          className="sb-calendar glass-chip rounded-pane min-h-[520px] flex-1 overflow-hidden"
          aria-label={mobile ? t('agenda') : t('title')}
          data-view={mobile ? 'agenda' : view}
          aria-busy={result.isFetching}
        >
          <FullCalendar
            ref={calendar}
            plugins={PLUGINS}
            initialView={actualView}
            initialDate={date}
            timeZone={time.timeZone}
            headerToolbar={false}
            firstDay={1}
            titleFormat={{
              year: 'numeric',
              month: 'long',
              ...(view === 'week' ? { day: 'numeric' } : {}),
            }}
            height={actualView === 'timeGridWeek' ? 600 : 'auto'}
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
            editable={can('posts:publish')}
            eventDurationEditable={false}
            eventMinHeight={56}
            eventInteractive
            eventLongPressDelay={350}
            eventDragMinDistance={8}
            dragRevertDuration={150}
            datesSet={datesSet}
            dateClick={dateClick}
            eventDrop={drop}
            eventAllow={(info) => scheduleProblem(info.start) === null}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              setPreview((info.event.extendedProps.entries as CalendarGroup)[0].postId);
            }}
            eventContent={(info) => (
              <>
                <span className="sr-only">{eventLabel(entriesOf(info))}</span>
                <div aria-hidden="true" className="min-w-0 flex-1">
                  <CalendarEventCard
                    entries={entriesOf(info)}
                    time={time.format(entriesOf(info)[0].at, 'time')}
                    noText={t('noText')}
                    statusLabels={statusLabels}
                    compact={view === 'week' && !mobile}
                  />
                </div>
              </>
            )}
            eventClass={(info) =>
              `sb-calendar-event sb-calendar-event--${entriesOf(info)[0].status}`
            }
            eventDidMount={(info) => {
              info.el.setAttribute('data-calendar-target', info.event.id);
            }}
            dayCellClass={(info) => `sb-calendar-day ${info.isToday ? 'sb-calendar-today' : ''}`}
            dayCellTopInnerClass="sb-calendar-date-control"
            dayCellDidMount={(info) => {
              // FullCalendar hides its decorative date label; ours contains a compose button.
              if (can('posts:create'))
                info.el.querySelector('.sb-calendar-date-control')?.removeAttribute('aria-hidden');
            }}
            dayCellTopContent={(info) => {
              const day = toLocalDate(wallClock(info.date.getTime(), time.timeZone));
              return can('posts:create') ? (
                <button
                  type="button"
                  className="sb-calendar-day-number"
                  aria-label={t('createOn', { date: formatLocalDate(day) })}
                  aria-current={info.isToday ? 'date' : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    create(composeAt(day, time.timeZone));
                  }}
                >
                  {info.dayNumberText}
                </button>
              ) : (
                <span
                  className="sb-calendar-day-number"
                  aria-current={info.isToday ? 'date' : undefined}
                >
                  {info.dayNumberText}
                </span>
              );
            }}
            dayHeaderClass="sb-calendar-heading"
            noEventsContent={t('emptyBody')}
          />
        </section>
      </div>
      {preview && (
        <PostPreview
          key={preview}
          postId={preview}
          close={() => {
            setPreview(null);
          }}
          busy={moves}
          reschedule={setRescheduling}
        />
      )}
      {rescheduling && (
        <RescheduleDialog
          key={`${rescheduling.targetId}:${rescheduling.at}`}
          entry={rescheduling}
          busy={moves.has(rescheduling.targetId)}
          close={() => {
            setRescheduling(null);
          }}
          move={async (entry, at) => {
            const ok = await move(entry, at);
            if (!ok) setRescheduling(null);
            return ok;
          }}
        />
      )}
    </div>
  );
}

function Filter({
  value,
  label,
  all,
  options,
  onChange,
}: {
  value: string | undefined;
  label: string;
  all: string;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? '_all'}
      onValueChange={(v) => {
        onChange(v === '_all' ? undefined : v);
      }}
    >
      <SelectTrigger aria-label={label} className="h-8 w-auto min-w-32 max-w-52 text-xs">
        <SelectValue placeholder={all} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">{all}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
