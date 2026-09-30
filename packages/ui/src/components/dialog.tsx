import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '../cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'bg-scrim fixed inset-0 z-50 backdrop-blur-[3px]',
        'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        className,
      )}
      {...props}
    />
  );
}

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  /** Accessible name of the close button (translate it). */
  closeLabel?: string;
  /** Hide the corner close button, e.g. for a confirmation with its own buttons. */
  hideClose?: boolean;
}

/**
 * A centered glass dialog. Always include a DialogTitle (and usually a DialogDescription): screen
 * readers announce them when the dialog opens. Focus is trapped inside and returns to the trigger.
 */
export function DialogContent({
  className,
  children,
  closeLabel = 'Close',
  hideClose = false,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'glass rounded-pane fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg',
          '-translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto p-6',
          'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
          // Its parts follow the dialog in, one after another.
          'stagger-children [--stagger-base:80ms]',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="text-ink-3 hover:bg-chip hover:text-ink absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg"
            aria-label={closeLabel}
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-ink text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-ink-2 text-sm leading-relaxed', className)}
      {...props}
    />
  );
}
