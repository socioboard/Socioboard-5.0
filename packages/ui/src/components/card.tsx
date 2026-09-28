import type { ComponentProps } from 'react';

import { cn } from '../cn';

/**
 * A light surface on glass: tiles in a grid, list rows grouped together. `selected` gives it the
 * violet selection ring. Render a button or link inside (or pass `asChild`-style markup) for
 * interactive cards, so keyboard and screen readers treat them as controls.
 */
export function Card({
  className,
  selected = false,
  ...props
}: ComponentProps<'div'> & { selected?: boolean }) {
  return (
    <div
      data-selected={selected ? '' : undefined}
      className={cn(
        'glass-chip rounded-control relative flex flex-col overflow-hidden',
        'data-[selected]:ring-selected',
        className,
      )}
      {...props}
    />
  );
}
