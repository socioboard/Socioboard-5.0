import type { ComponentProps, ReactNode } from 'react';

import { cn } from '../cn';

/** A keyboard key or shortcut, e.g. <Kbd>⌘K</Kbd>. */
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'bg-chip border-hair-strong text-ink-3 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border px-1.5 font-sans text-[11px] font-semibold',
        className,
      )}
      {...props}
    />
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  /** Controls on the right (view switch, primary action). */
  actions?: ReactNode;
  /** Content before the title, e.g. a back link or the mobile menu button. */
  leading?: ReactNode;
  className?: string;
}

/** The 56 px bar at the top of a content pane, holding the page's h1. */
export function PageHeader({ title, actions, leading, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'border-hair flex h-14 shrink-0 items-center gap-3 border-b pr-3 pl-4 sm:pl-5',
        className,
      )}
    >
      {leading}
      <h1 className="min-w-0 truncate text-base font-semibold tracking-tight">{title}</h1>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}
