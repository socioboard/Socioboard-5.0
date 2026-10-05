import type { CalendarEntry } from '@socioboard/contracts';
import { Repeat } from 'lucide-react';
import { cn } from '../cn';
import { Avatar } from './display';
import { MediaThumb } from './composer';
import { NetworkIcon } from './network-icon';
import { StatusChip } from './status-chip';

/** Content inside an interactive calendar event; the calendar owns focus and dragging. */
export function CalendarEventCard({
  entries,
  time,
  noText,
  statusLabels,
  compact = false,
}: {
  entries: readonly CalendarEntry[];
  time: string;
  noText: string;
  statusLabels: Record<CalendarEntry['status'], string>;
  compact?: boolean;
}) {
  const first = entries[0];
  if (!first) return null;
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
      <div className="flex min-w-0 items-start gap-2">
        <p
          className={cn(
            'text-ink min-w-0 flex-1 text-xs leading-snug',
            compact ? 'truncate' : 'line-clamp-2',
          )}
        >
          {first.text || noText}
        </p>
        {!compact && first.thumbnailUrl && (
          <MediaThumb
            src={first.thumbnailUrl}
            kind="image"
            alt={first.text || noText}
            className="size-9 shrink-0"
          />
        )}
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
