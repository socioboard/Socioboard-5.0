import type { ComponentProps } from 'react';

import { cn } from '../cn';

/**
 * Tabs that are pages (each has its own URL): a row of links. Put router links inside; the active
 * one needs `aria-current="page"` or `data-status="active"` (TanStack Router sets the latter).
 * For tabs that switch panels within one page, use Radix Tabs (added when a screen needs them).
 */
export function NavTabs({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        'border-hair flex shrink-0 gap-1 overflow-x-auto border-b px-3 sm:px-4',
        '[&>a]:text-ink-3 [&>a]:hover:text-ink [&>a]:relative [&>a]:flex [&>a]:h-10 [&>a]:items-center [&>a]:px-2.5 [&>a]:text-[13px] [&>a]:font-medium [&>a]:whitespace-nowrap',
        '[&>a[data-status=active]]:text-ink [&>a[aria-current=page]]:text-ink',
        // Active underline in the selection color.
        "[&>a[data-status=active]]:after:bg-ring [&>a[data-status=active]]:after:absolute [&>a[data-status=active]]:after:inset-x-2 [&>a[data-status=active]]:after:-bottom-px [&>a[data-status=active]]:after:h-0.5 [&>a[data-status=active]]:after:rounded-full [&>a[data-status=active]]:after:content-['']",
        className,
      )}
      {...props}
    />
  );
}
