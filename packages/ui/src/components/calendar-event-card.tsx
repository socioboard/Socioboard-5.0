import type { CalendarEntry } from '@socioboard/contracts';
import { Repeat } from 'lucide-react';
import { cn } from '../cn';
import { Avatar } from './display';
import { NetworkIcon } from './network-icon';
import { StatusChip } from './status-chip';

/**
 * Content inside an interactive calendar event; the calendar owns focus and dragging.
 * `line`: one line (time, text, avatars), so a month fits on one screen; `compact`: two lines
 * (week view); otherwise the full card with networks and statuses (the phone's agenda).
 */
export function CalendarEventCard({
  entries,
  time,
  noText,
  statusLabels,
  compact = false,
  line = false,
}: {
  entries: readonly CalendarEntry[];
  time: string;
  noText: string;
  statusLabels: Record<CalendarEntry['status'], string>;
  compact?: boolean;
  line?: boolean;
}) {
  const first = entries[0];
  if (!first) return null;
  if (line) {
    return (
      <div className="flex w-full min-w-0 items-center gap-1.5 px-1.5 py-0.5 text-left">
        <span className="text-ink-2 shrink-0 text-[11px] font-semibold tabular-nums">{time}</span>
        <span className="text-ink min-w-0 flex-1 truncate text-xs">{first.text || noText}</span>
        {first.recurring && <Repeat className="text-ink-3 size-3 shrink-0" aria-hidden="true" />}
        <span className="flex shrink-0 -space-x-1" aria-hidden="true">
          {entries.slice(0, 2).map((e) => (
            <Avatar
              key={e.targetId}
              name={e.account.displayName}
              src={e.account.avatarUrl}
              size="xs"
              decorative
              className="ring-canvas size-4 text-[8px] ring-1"
            />
          ))}
        </span>
        {entries.length > 2 && (
          <span className="text-ink-3 shrink-0 text-[10px]">+{entries.length - 2}</span>
        )}
      </div>
    );
  }
  const statuses = [...new Set(entries.map((e) => e.status))];
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-1.5 p-2 text-left',
        compact && 'gap-0.5 p-1.5',
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-ink-2 shrink-0 text-[11px] font-semibold tabular-nums">{time}</span>
        <div className="ml-auto flex -space-x-1" aria-hidden="true">
          {entries.slice(0, 3).map((e) => (
            <span key={e.targetId} className="bg-canvas rounded-full p-0.5">
              <Avatar name={e.account.displayName} src={e.account.avatarUrl} size="xs" decorative />
            </span>
          ))}
        </div>
        {entries.length > 3 && (
          <span className="text-ink-3 text-[10px]">+{entries.length - 3}</span>
        )}
        {first.recurring && <Repeat className="text-ink-3 size-3 shrink-0" aria-hidden="true" />}
      </div>
      {!compact && first.thumbnailUrl && (
        <img
          src={first.thumbnailUrl}
          alt=""
          loading="lazy"
          className="h-16 w-full rounded-md object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="flex min-w-0 items-start gap-2">
        <p
          className={cn(
            'text-ink min-w-0 flex-1 text-xs leading-snug',
            compact ? 'truncate' : 'line-clamp-2',
          )}
        >
          {first.text || noText}
        </p>
      </div>
      <div className={cn('flex flex-wrap items-center gap-1', compact && 'hidden')}>
        {[...new Set(entries.map((e) => e.account.network))].map((n) => (
          <NetworkIcon key={n} network={n} size="sm" variant="glyph" decorative />
        ))}
        {statuses.map((s) => (
          <StatusChip
            key={s}
            status={s}
            label={statusLabels[s]}
            className="px-1.5 py-0 text-[10px]"
          />
        ))}
      </div>
    </div>
  );
}
