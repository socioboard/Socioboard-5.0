import type { ReactNode } from 'react';

import { cn } from '../cn';

/** A glass pane around a story, as components sit in the app. */
export function Pane({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('glass rounded-pane flex max-w-3xl flex-col gap-4 p-6', className)}>
      {title && <h2 className="text-ink-3 text-xs font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
