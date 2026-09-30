import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '../cn';

/** Mount once near the root; tooltips share its open delay. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={400} skipDelayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export interface TooltipProps {
  /** What the tooltip says. It supplements a visible or aria label; it is never the only name. */
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Render the child without a tooltip (e.g. the label is already visible). */
  disabled?: boolean;
  children: ReactElement;
}

/** A short label on hover or keyboard focus, e.g. for icon-only buttons. */
export function Tooltip({ content, side = 'top', disabled = false, children }: TooltipProps) {
  if (disabled) return children;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className={cn(
            'glass-float text-ink z-50 rounded-lg px-2.5 py-1.5 text-xs font-medium',
            'origin-(--radix-tooltip-content-transform-origin) data-[state=delayed-open]:animate-pop-in data-[state=closed]:animate-pop-out motion-reduce:animate-none',
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
