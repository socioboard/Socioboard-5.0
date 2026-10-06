import { useLayoutEffect, useRef, type ComponentProps } from 'react';

import { cn } from '../cn';

const ACTIVE = '[data-status="active"], [aria-current="page"]';

/**
 * Tabs that are pages (each has its own URL): a row of links. Put router links inside; the active
 * one needs `aria-current="page"` or `data-status="active"` (TanStack Router sets the latter). The
 * underline glides to the active tab when it changes (docs/frontend/design-system.md, "Motion").
 * For tabs that switch panels within one page, use Radix Tabs (added when a screen needs them).
 */
export function NavTabs({ className, children, ...props }: ComponentProps<'nav'>) {
  const nav = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // Follows the active link: on route changes (its attributes change), and on resizes.
  useLayoutEffect(() => {
    const root = nav.current;
    const line = bar.current;
    if (!root || !line) return;
    let placed = false;
    const place = () => {
      const active = root.querySelector<HTMLElement>(`:scope > a:is(${ACTIVE})`);
      if (!active) {
        line.style.opacity = '0';
        return;
      }
      // The first placement doesn't slide in from the left edge.
      line.style.transitionProperty = placed ? '' : 'none';
      line.style.opacity = '1';
      line.style.width = `${String(active.offsetWidth - 16)}px`;
      line.style.transform = `translateX(${String(active.offsetLeft + 8)}px)`;
      placed = true;
    };
    place();
    const attrs = new MutationObserver(place);
    attrs.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-status', 'aria-current'],
    });
    const size = new ResizeObserver(place);
    size.observe(root);
    return () => {
      attrs.disconnect();
      size.disconnect();
    };
  }, []);

  return (
    <nav
      ref={nav}
      className={cn(
        // overflow-y-hidden: the active underline sits on the border; it mustn't add a scrollbar.
        'border-hair relative flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden border-b px-3 sm:px-4',
        '[&>a]:text-ink-3 [&>a]:hover:text-ink [&>a]:relative [&>a]:flex [&>a]:h-10 [&>a]:items-center [&>a]:px-2.5 [&>a]:text-[13px] [&>a]:font-medium [&>a]:whitespace-nowrap [&>a]:transition-colors [&>a]:duration-200',
        '[&>a[data-status=active]]:text-ink [&>a[aria-current=page]]:text-ink',
        className,
      )}
      {...props}
    >
      {children}
      {/* The underline, in the selection color, gliding between tabs. */}
      <span
        ref={bar}
        aria-hidden="true"
        className="bg-ring pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full opacity-0 transition-[transform,width] duration-250 ease-spring motion-reduce:transition-none"
      />
    </nav>
  );
}
