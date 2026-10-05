import { Plus } from 'lucide-react';
import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { laneTime, scheduleProblem } from '../model';

interface Ghost {
  lane: HTMLElement;
  top: number;
  height: number;
  at: Date;
}

/**
 * Week view: a faint "+ 2:30 PM" card follows the mouse down each day's column, snapped to 15
 * minutes, and a click opens the composer at exactly that time. It isn't offered where a post
 * can't be scheduled (the past, the next 2 minutes), over a post, while dragging, or for touch
 * and pens (they tap a slot instead). Keyboard users have the "New post" button and the N key.
 */
export function HoverCreate({
  container,
  lanes,
  timeZone,
  enabled,
  format,
  label,
  onCreate,
}: {
  container: RefObject<HTMLElement | null>;
  /** Each day's column in the week view, with its date (`YYYY-MM-DD`). */
  lanes: RefObject<Map<HTMLElement, string>>;
  timeZone: string;
  enabled: boolean;
  format: (at: Date) => string;
  label: (time: string) => string;
  onCreate: (at: Date) => void;
}) {
  const [ghost, setGhost] = useState<Ghost | null>(null);
  useEffect(() => {
    const el = container.current;
    if (!el || !enabled) return;
    const clear = () => {
      setGhost(null);
    };
    const move = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (event.pointerType !== 'mouse' || event.buttons !== 0) {
        clear();
        return;
      }
      if (target?.closest('.sb-calendar-ghost')) return;
      if (target?.closest('.sb-calendar-event')) {
        clear();
        return;
      }
      for (const [lane, day] of lanes.current) {
        const rect = lane.getBoundingClientRect();
        if (rect.height < 200) continue;
        if (
          event.clientX < rect.left ||
          event.clientX >= rect.right ||
          event.clientY < rect.top ||
          event.clientY >= rect.bottom
        )
          continue;
        const fraction = (event.clientY - rect.top) / rect.height;
        const at = laneTime(day, fraction, timeZone);
        if (scheduleProblem(at) !== null) {
          clear();
          return;
        }
        // Placed at its quarter of an hour on the column's own (wall-clock) scale.
        const steps = 96;
        const top = (Math.min(steps - 1, Math.floor(fraction * steps)) / steps) * rect.height;
        setGhost((old) =>
          old?.lane === lane && old.at.getTime() === at.getTime()
            ? old
            : { lane, top, height: rect.height / 48, at },
        );
        return;
      }
      clear();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', clear);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', clear);
    };
  }, [container, lanes, timeZone, enabled]);

  // Turned off (dragging, another view): whatever was last shown goes with it.
  if (!enabled || !ghost?.lane.isConnected) return null;
  const time = format(ghost.at);
  return createPortal(
    <button
      type="button"
      // A mouse shortcut; the same thing is reachable without it (see above).
      tabIndex={-1}
      aria-label={label(time)}
      className="sb-calendar-ghost"
      style={{ top: ghost.top, minHeight: Math.max(ghost.height, 26) }}
      // FullCalendar would take the press as a click on its slot (a half-hour, not this quarter).
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onCreate(ghost.at);
      }}
    >
      <Plus aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{time}</span>
    </button>,
    ghost.lane,
  );
}
