import type { CalendarRef, DateClickInfo, EventDropInfo, EventInput } from '@fullcalendar/react';
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
  Kbd,
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
import { useQueries, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, queueSlotsQuery } from '../../accounts';
import { GettingStarted } from '../../onboarding';
import { labelsQuery } from '../../posts';
import { calendarQuery } from '../api';
import {
  belongsToRange,
  composeAt,
  groupEntries,
  openSlots,
  scheduleProblem,
  type CalendarSearch,
  shortcutOf,
  swipeOf,
  type CalendarGroup,
} from '../model';
import { useReschedule } from '../use-reschedule';
import { CalendarGrid, type GridHandlers } from './calendar-grid';
import { HoverCreate } from './hover-create';
import { HoverPreview, type HoverTarget } from './hover-preview';
import { PostPreview } from './post-preview';
import { RescheduleDialog } from './reschedule-dialog';
import './calendar.css';

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
  // The section the calendar draws in, and each week column with its day (hover to create).
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const lanes = useRef(new Map<HTMLElement, string>());
  // Hover preview: shown after the pointer rests on a card, kept while it moves onto the preview.
  const [hover, setHover] = useState<HoverTarget | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hoverAt = (delay: number, next: HoverTarget | null) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!dragging.current) setHover(next);
    }, delay);
  };
  useEffect(
    () => () => {
      clearTimeout(hoverTimer.current);
    },
    [],
  );
  const finePointer = useFinePointer();
  // While a card is dragged: a label by the pointer says where it would land. Kept out of React
  // state: re-rendering the calendar mid-drag would cancel the drag.
  const dragging = useRef(false);
  const dragLabel = useRef<HTMLDivElement>(null);
  const followDrag = useRef((e: PointerEvent) => {
    const el = dragLabel.current;
    if (el)
      el.style.transform = `translate(${String(e.clientX + 16)}px, ${String(e.clientY + 18)}px)`;
  });
  const setDragging = (on: boolean) => {
    dragging.current = on;
    if (on) {
      clearTimeout(hoverTimer.current);
      document.documentElement.setAttribute('data-sb-calendar-dragging', '');
      window.addEventListener('pointermove', followDrag.current);
    } else {
      document.documentElement.removeAttribute('data-sb-calendar-dragging');
      window.removeEventListener('pointermove', followDrag.current);
      showDragTime(null, false);
    }
  };
  useEffect(
    () => () => {
      document.documentElement.removeAttribute('data-sb-calendar-dragging');
      window.removeEventListener('pointermove', followDrag.current);
    },
    [],
  );
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
  // Week view on a desktop shows each account's free posting times (at most 20 accounts).
  const queueAccounts = (accounts.data ?? [])
    .filter((a) => a.status === 'active' && (!search.account || a.id === search.account))
    .slice(0, 20);
  const showSlots = view === 'week' && !mobile && !search.status && !search.label;
  const queues = useQueries({
    queries: queueAccounts.map((a) => ({
      ...queueSlotsQuery(workspace.id, a.id),
      enabled: showSlots,
    })),
  });
  const slotKey = queues.map((q) => q.dataUpdatedAt).join(',');
  const slotAccounts = queueAccounts.map((a) => a.id).join(',');
  const open = useMemo(
    () =>
      showSlots && period
        ? openSlots(
            queueAccounts.flatMap((a, i) => {
              const data = queues[i]?.data;
              return data
                ? [{ account: { id: a.id, name: a.displayName }, upcoming: data.upcoming }]
                : [];
            }),
            period.from,
            period.to,
          )
        : [],
    // The queries' data, by when each last changed (the arrays themselves are new each render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showSlots, period, slotKey, slotAccounts],
  );
  const statusLabels = useMemo(
    () =>
      Object.fromEntries(STATUSES.map((s) => [s, postT(`status.${s}`)])) as Record<
        CalendarEntry['status'],
        string
      >,
    [postT],
  );
  const datesSet = (info: { start: Date; end: Date; view: { title: string } }) => {
    const next = {
      from: info.start.toISOString(),
      to: info.end.toISOString(),
      title: info.view.title,
    };
    setPeriod((old) =>
      old?.from === next.from && old.to === next.to && old.title === next.title ? old : next,
    );
  };
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
  const allEvents = useMemo<EventInput[]>(
    () => [
      ...open.map((slot) => ({
        id: `slot:${slot.at}`,
        title: t('openSlot'),
        start: slot.at,
        startEditable: false,
        durationEditable: false,
        extendedProps: { slot },
      })),
      ...events,
    ],
    [open, events, t],
  );
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
  const showDragTime = (at: Date | null, invalid: boolean) => {
    const el = dragLabel.current;
    if (!el) return;
    el.textContent = invalid
      ? t('cantMove')
      : at
        ? t('moveTo', { time: time.format(at, 'long') })
        : '';
    el.dataset.invalid = String(invalid);
  };
  const shift = (direction: -1 | 1) => {
    const d = parseLocalDate(date);
    const next =
      view === 'week'
        ? toLocalDate(addDays(d, direction * 7))
        : new Date(Date.UTC(d.year, d.month - 1 + direction, 1)).toISOString().slice(0, 10);
    onSearchChange({ date: next });
  };
  const buildHandlers = (): GridHandlers => ({
    datesSet,
    dateClick,
    drop,
    allow: (start) => {
      const ok = scheduleProblem(start) === null;
      showDragTime(start, !ok);
      return ok;
    },
    dragStart: () => {
      showDragTime(null, false);
      setDragging(true);
    },
    dragStop: () => {
      setDragging(false);
      setHover(null);
    },
    enter: (info) => {
      if (!finePointer || dragging.current) return;
      hoverAt(380, {
        entries: info.event.extendedProps.entries as CalendarGroup,
        rect: info.el.getBoundingClientRect(),
      });
    },
    leave: () => {
      hoverAt(160, null);
    },
    openSlot: (slot) => {
      if (!can('posts:create')) return;
      void navigate({
        to: '/w/$slug/compose/{-$postId}',
        params: { slug: workspace.slug, postId: undefined },
        search: {
          at: slot.at,
          ...(slot.accounts.length === 1 ? { account: slot.accounts[0]?.id } : {}),
        },
      });
    },
    open: (entries) => {
      setHover(null);
      setPreview(entries[0].postId);
    },
    createOn: (day) => {
      create(composeAt(day, time.timeZone));
    },
    lane: (el, day) => {
      if (day) lanes.current.set(el, day);
      else lanes.current.delete(el);
    },
  });
  const handlers = useRef<GridHandlers | null>(null);
  handlers.current ??= buildHandlers();
  useLayoutEffect(() => {
    handlers.current = buildHandlers();
  });
  // Keys: ← → periods, T today, M/W views, N new post.
  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    const key = shortcutOf(e);
    if (!key || (key === 'new' && !can('posts:create'))) return;
    e.preventDefault();
    if (key === 'previous') shift(-1);
    else if (key === 'next') shift(1);
    else if (key === 'today') onSearchChange({ date: today });
    else if (key === 'month' || key === 'week') onSearchChange({ view: key });
    else
      void navigate({
        to: '/w/$slug/compose/{-$postId}',
        params: { slug: workspace.slug, postId: undefined },
      });
  });
  useEffect(() => {
    window.addEventListener('keydown', onShortcut);
    return () => {
      window.removeEventListener('keydown', onShortcut);
    };
  }, []);
  // A new period slides in from the side it lies on; a new view settles in place.
  const shown = useRef<{ from: string; view: string } | null>(null);
  useEffect(() => {
    const el = grid.current;
    if (!period || !el) return;
    const before = shown.current;
    shown.current = { from: period.from, view: actualView };
    if (!before || (before.from === period.from && before.view === actualView)) return;
    if (typeof el.animate !== 'function') return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = period.from > before.from ? 1 : -1;
    const from = still
      ? { opacity: 0.4 }
      : before.view !== actualView
        ? { opacity: 0.3, transform: 'scale(0.985)', filter: 'blur(3px)' }
        : {
            opacity: 0.35,
            transform: `translateX(${String(direction * 28)}px)`,
            filter: 'blur(2px)',
          };
    el.animate([from, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], {
      duration: still ? 150 : 420,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  }, [period, actualView]);
  // Phones: swipe the agenda sideways to change period.
  const swipe = useRef<{ x: number; y: number } | null>(null);
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
            <Tooltip content={<Hint label={t('previous')} keys={t('shortcuts.previous')} />}>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('previous')}
                aria-keyshortcuts="ArrowLeft"
                onClick={() => {
                  shift(-1);
                }}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip content={<Hint label={t('next')} keys={t('shortcuts.next')} />}>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('next')}
                aria-keyshortcuts="ArrowRight"
                onClick={() => {
                  shift(1);
                }}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip content={<Hint label={t('today')} keys={t('shortcuts.today')} />}>
              <Button
                size="sm"
                aria-keyshortcuts="T"
                onClick={() => {
                  onSearchChange({ date: today });
                }}
              >
                {t('today')}
              </Button>
            </Tooltip>
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
                <Tooltip key={v} content={<Hint label={t(v)} keys={t(`shortcuts.${v}`)} />}>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-pressed={view === v}
                    aria-keyshortcuts={v === 'month' ? 'M' : 'W'}
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
                </Tooltip>
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
          ref={section}
          // Grows to fill, never shrinks below its grid: with overflow hidden (the rounded corners),
          // shrinking clipped the month's last weeks instead of letting the page scroll.
          className="sb-calendar glass-chip rounded-pane min-h-[520px] flex-[1_0_auto] overflow-hidden"
          onPointerDown={(e) => {
            swipe.current = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start || !mobile) return;
            const direction = swipeOf(e.clientX - start.x, e.clientY - start.y);
            if (direction) shift(direction);
          }}
          aria-label={mobile ? t('agenda') : t('title')}
          data-view={mobile ? 'agenda' : view}
          aria-busy={result.isFetching}
        >
          <div ref={grid} className="h-full">
            <CalendarGrid
              calendarRef={calendar}
              handlers={handlers}
              events={allEvents}
              initialView={actualView}
              initialDate={date}
              weekTitle={view === 'week'}
              height={actualView === 'timeGridWeek' ? 600 : 'auto'}
              editable={can('posts:publish')}
              compactCards={view === 'week' && !mobile}
              canCreate={can('posts:create')}
              statusLabels={statusLabels}
            />
          </div>
          <HoverCreate
            container={section}
            lanes={lanes}
            timeZone={time.timeZone}
            enabled={view === 'week' && !mobile && can('posts:create')}
            format={(at) => time.format(at, 'time')}
            label={(at) => t('newAt', { time: at })}
            onCreate={create}
          />
        </section>
      </div>
      <HoverPreview
        target={preview !== null || rescheduling !== null ? null : hover}
        statusLabels={statusLabels}
        canReschedule={can('posts:publish')}
        onOpen={(entries) => {
          setHover(null);
          setPreview(entries[0].postId);
        }}
        onReschedule={(entry) => {
          setHover(null);
          setRescheduling(entry);
        }}
        onPointerEnter={() => {
          clearTimeout(hoverTimer.current);
        }}
        onPointerLeave={() => {
          hoverAt(160, null);
        }}
      />
      {createPortal(
        <div ref={dragLabel} className="sb-calendar-drag-label" role="status" aria-live="polite" />,
        document.body,
      )}
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

/** A tooltip's words with its key. */
function Hint({ label, keys }: { label: string; keys: string }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      <Kbd>{keys}</Kbd>
    </span>
  );
}

/** A mouse or trackpad (hover previews and hover-to-create are for these only). */
function useFinePointer() {
  const [fine, setFine] = useState(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => {
      setFine(media.matches);
    };
    media.addEventListener('change', update);
    return () => {
      media.removeEventListener('change', update);
    };
  }, []);
  return fine;
}
