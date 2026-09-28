import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '../cn';
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

/** Slides in from the right; on phones it becomes a bottom sheet. Include a DrawerTitle. */
export function DrawerContent({
  className,
  children,
  closeLabel = 'Close',
  ...props
}: DrawerContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'glass fixed z-50 flex flex-col gap-4 overflow-y-auto p-6 motion-reduce:animate-none',
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
        {children}
        <DialogPrimitive.Close
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
