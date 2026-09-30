import { X } from 'lucide-react';
import { animate } from 'motion/react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef, type ComponentProps, type PointerEvent } from 'react';

import { cn } from '../cn';
import { createVelocityTracker, project, rubberband } from '../gestures';
import { springs } from '../motion';
import { DialogDescription, DialogOverlay, DialogTitle } from './dialog';

// A drawer is a dialog anchored to an edge: same focus trapping, Escape and screen-reader behavior.
export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;

export interface DrawerContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** Accessible name of the close button (translate it). */
  closeLabel?: string;
}

/** Phones (under 640 px) get the bottom sheet, which can be dragged down to close. */
const SHEET_QUERY = '(max-width: 639.98px)';

/**
 * Drag to dismiss (the apple-design skill, §2–§9): the sheet follows the finger 1:1 from where it
 * was grabbed, resists being pulled up (rubber band), and on release goes where the gesture was
 * heading: projected past half its height, it closes (continuing down from where it is); otherwise
 * it springs back, keeping the finger's speed. Grabbing it mid-spring takes it from there.
 */
function useSheetDrag(close: () => void) {
  // A drag exists only between press and release (moves without a press, a hovering mouse, are
  // ignored); `spring` stops a spring-back still running when the sheet is grabbed again.
  const drag = useRef<{ grab: number; pointerId: number } | null>(null);
  const spring = useRef<(() => void) | null>(null);
  // Where the sheet is drawn right now (mid-drag or mid-spring), in px below its resting place.
  const offset = useRef(0);
  const tracker = useRef(createVelocityTracker());
  const moveTo = (sheet: HTMLElement, y: number) => {
    offset.current = y;
    sheet.style.transform = y === 0 ? '' : `translateY(${String(y)}px)`;
  };

  const sheetOf = (e: PointerEvent<HTMLElement>) =>
    e.currentTarget.closest<HTMLElement>('[data-drawer-content]');

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      const sheet = sheetOf(e);
      if (!sheet || !window.matchMedia(SHEET_QUERY).matches) return;
      // Keep receiving moves when the finger leaves the handle; tracking works without it too.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // No such pointer (a synthetic event): carry on without capture.
      }
      spring.current?.();
      spring.current = null;
      // Respect where it was grabbed: continue from its current offset, not from 0.
      drag.current = { grab: e.clientY - offset.current, pointerId: e.pointerId };
      tracker.current.reset();
      tracker.current.add(e.clientY, e.timeStamp);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const sheet = sheetOf(e);
      if (!sheet || drag.current?.pointerId !== e.pointerId) return;
      const raw = e.clientY - drag.current.grab;
      moveTo(sheet, raw >= 0 ? raw : -rubberband(-raw, sheet.offsetHeight));
      tracker.current.add(e.clientY, e.timeStamp);
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const sheet = sheetOf(e);
      if (!sheet || drag.current?.pointerId !== e.pointerId) return;
      drag.current = null;
      // The release itself counts: a finger that paused before letting go has no speed left.
      tracker.current.add(e.clientY, e.timeStamp);
      const velocity = tracker.current.velocity();
      const y = offset.current;
      if (y + project(velocity) > sheet.offsetHeight / 2) {
        // Closing continues down from here (the exit animation starts at the current offset).
        close();
        return;
      }
      const controls = animate(y, 0, {
        ...springs.momentum,
        velocity,
        onUpdate: (v) => {
          moveTo(sheet, v);
        },
        onComplete: () => {
          moveTo(sheet, 0);
        },
      });
      spring.current = () => {
        controls.stop();
      };
    },
  };
}

/** Slides in from the right; on phones it becomes a bottom sheet. Include a DrawerTitle. */
export function DrawerContent({
  className,
  children,
  closeLabel = 'Close',
  ...props
}: DrawerContentProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const handlers = useSheetDrag(() => closeButton.current?.click());
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-drawer-content=""
        className={cn(
          'glass fixed z-50 flex flex-col gap-4 overflow-y-auto p-6',
          // Its parts follow the panel in, one after another.
          'stagger-children [--stagger-base:120ms]',
          // Phone: bottom sheet.
          'inset-x-2 bottom-2 max-h-[85dvh] rounded-pane',
          'data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom',
          // Tablet and up: right-hand panel.
          'sm:inset-x-auto sm:top-3 sm:right-3 sm:bottom-3 sm:max-h-none sm:w-[26rem]',
          'sm:data-[state=open]:animate-sheet-in-right sm:data-[state=closed]:animate-sheet-out-right',
          className,
        )}
        {...props}
      >
        {/* Phones: a grab handle to drag the sheet down (the close button does the same for
            keyboards and screen readers). */}
        <div
          aria-hidden="true"
          data-drawer-handle=""
          className="absolute inset-x-0 top-0 flex h-7 cursor-grab touch-none justify-center pt-2 active:cursor-grabbing sm:hidden"
          {...handlers}
          onPointerCancel={(e) => {
            handlers.onPointerUp(e);
          }}
        >
          <span className="bg-hair-strong h-1.5 w-10 rounded-full" />
        </div>
        {children}
        <DialogPrimitive.Close
          ref={closeButton}
          className="text-ink-3 hover:bg-chip hover:text-ink absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg"
          aria-label={closeLabel}
        >
          <X className="size-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />;
}
