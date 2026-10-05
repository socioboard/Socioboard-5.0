import type { CalendarEntry } from '@socioboard/contracts';
import {
  AnimatePresence,
  Avatar,
  Button,
  motion,
  NetworkIcon,
  springs,
  StatusChip,
} from '@socioboard/ui';
import { Repeat } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import type { CalendarGroup } from '../model';

const WIDTH = 320;
const GAP = 10;
const MARGIN = 12;

export interface HoverTarget {
  entries: CalendarGroup;
  /** The card's place on screen when the pointer came to rest on it. */
  rect: DOMRect;
}

/**
 * Resting the mouse on a card shows the post without opening it: the full text the calendar
 * has, its picture, each account with its status, why a delivery failed, and the next steps.
 * It sits beside the card (whichever side has room) and grows from that side. Clicking the card
 * still opens the full preview, which is also what keyboard and touch users get.
 */
export function HoverPreview({
  target,
  statusLabels,
  canReschedule,
  onOpen,
  onReschedule,
  onPointerEnter,
  onPointerLeave,
}: {
  target: HoverTarget | null;
  statusLabels: Record<CalendarEntry['status'], string>;
  canReschedule: boolean;
  onOpen: (entries: CalendarGroup) => void;
  onReschedule: (entry: CalendarEntry) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  // On the page itself: inside the content pane, its frosted glass (backdrop-filter) would make
  // `fixed` relative to the pane instead of the window.
  return createPortal(
    <AnimatePresence>
      {target && (
        <Card
          key={target.entries[0].postId + target.entries[0].at}
          target={target}
          statusLabels={statusLabels}
          canReschedule={canReschedule}
          onOpen={onOpen}
          onReschedule={onReschedule}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Card({
  target,
  statusLabels,
  canReschedule,
  onOpen,
  onReschedule,
  onPointerEnter,
  onPointerLeave,
}: {
  target: HoverTarget;
  statusLabels: Record<CalendarEntry['status'], string>;
  canReschedule: boolean;
  onOpen: (entries: CalendarGroup) => void;
  onReschedule: (entry: CalendarEntry) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const { t } = useTranslation('calendar');
  const time = useWorkspaceTime();
  const { entries, rect } = target;
  const first = entries[0];
  const right = rect.right + GAP + WIDTH <= window.innerWidth - MARGIN;
  const left = right ? rect.right + GAP : Math.max(MARGIN, rect.left - GAP - WIDTH);
  // Kept on screen once its height is known.
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(rect.top);
  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 0;
    setTop(Math.max(MARGIN, Math.min(rect.top, window.innerHeight - height - MARGIN)));
  }, [rect.top]);
  const failed = entries.filter((e) => e.status === 'failed' && e.lastError);
  const movable = entries.length === 1 && first.status === 'scheduled' && canReschedule;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={t('quickLook')}
      className="sb-calendar-quicklook glass-float fixed z-40 flex flex-col gap-3 rounded-[14px] p-4"
      style={{ left, top, width: WIDTH, transformOrigin: right ? 'left top' : 'right top' }}
      initial={{ opacity: 0, scale: 0.94, x: right ? -6 : 6, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)', transition: springs.snappy }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="flex items-center gap-2">
        <span className="text-ink text-[13px] font-semibold">{time.format(first.at, 'long')}</span>
        {first.recurring && <Repeat className="text-ink-3 size-3.5" aria-label={t('recurring')} />}
      </div>
      {first.thumbnailUrl && (
        <img
          src={first.thumbnailUrl}
          alt=""
          className="h-36 w-full rounded-[10px] object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <p className="text-ink line-clamp-6 text-[13px] leading-relaxed whitespace-pre-wrap wrap-break-word">
        {first.text || t('noText')}
      </p>
      <ul className="flex flex-col gap-1.5">
        {entries.slice(0, 4).map((e) => (
          <li key={e.targetId} className="flex items-center gap-2">
            <Avatar name={e.account.displayName} src={e.account.avatarUrl} size="xs" decorative />
            <span className="text-ink-2 min-w-0 flex-1 truncate text-xs">
              {e.account.displayName}
            </span>
            <NetworkIcon network={e.account.network} size="sm" variant="glyph" decorative />
            <StatusChip
              status={e.status}
              label={statusLabels[e.status]}
              className="px-1.5 py-0 text-[10px]"
            />
          </li>
        ))}
        {entries.length > 4 && (
          <li className="text-ink-3 text-xs">{t('moreAccounts', { count: entries.length - 4 })}</li>
        )}
      </ul>
      {failed.map((e) => (
        <p key={e.targetId} className="bg-danger-tint text-ink rounded-lg px-2.5 py-2 text-xs">
          {t('failedBecause', { reason: e.lastError?.message ?? '' })}
        </p>
      ))}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            onOpen(entries);
          }}
        >
          {t('open')}
        </Button>
        {movable && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onReschedule(first);
            }}
          >
            {t('reschedule')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
