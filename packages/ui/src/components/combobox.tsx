import { Check, ChevronDown, Search } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../cn';
import { matchesAll, searchWords } from '../search';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Shown to the right of the label, e.g. an offset or a count. */
  hint?: string;
  /** Extra words the search matches but doesn't show (aliases, abbreviations). */
  keywords?: string;
}

export interface ComboboxProps extends Omit<
  ComponentProps<'button'>,
  'value' | 'onChange' | 'children' | 'type'
> {
  options: readonly ComboboxOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  /** Shown on the button while nothing is chosen. */
  placeholder?: ReactNode;
  /** Label and placeholder of the search box inside the list. */
  searchLabel: string;
  /** Shown when the search matches nothing. */
  emptyText: ReactNode;
}

function matches(option: ComboboxOption, words: string[]): boolean {
  return matchesAll(`${option.label} ${option.hint ?? ''} ${option.keywords ?? ''}`, words);
}

/** Scrolls the list (only the list; scrollIntoView could also move the page) to center the choice. */
function centerSelected(list: HTMLElement) {
  const option = list.querySelector<HTMLElement>('[aria-selected="true"]');
  if (!option) return;
  const offset = option.getBoundingClientRect().top - list.getBoundingClientRect().top;
  list.scrollTop += offset - (list.clientHeight - option.offsetHeight) / 2;
}

/**
 * A Select with a search box, for long lists (time zones, countries). The button opens a glass
 * popover; typing filters, arrow keys move, Enter picks, Escape closes and returns focus. Takes
 * FormField's control props like any input:
 *   <FormField label="Time zone">{(p) => <Combobox {...p} options={zones} … />}</FormField>
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchLabel,
  emptyText,
  className,
  disabled,
  ...buttonProps
}: ComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  // While true, the list keeps the current choice centered as the popover settles its size (it
  // can shrink after opening, e.g. when it flips above the field on a phone). The first key,
  // search or scroll hands control to the user.
  const keepCentered = useRef(false);

  const filtered = useMemo(() => {
    const words = searchWords(query);
    return options.filter((o) => matches(o, words));
  }, [options, query]);
  const selected = options.find((o) => o.value === value);
  const optionId = (index: number) => `${listId}-${String(index)}`;

  const moveTo = (index: number) => {
    const next = Math.max(0, Math.min(index, filtered.length - 1));
    setActive(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
  };

  // Stable (no deps), so React attaches the observer once per open rather than on every render.
  const observeList = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      if (keepCentered.current) centerSelected(node);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      listRef.current = null;
    };
  }, []);
  const stopCentering = () => {
    keepCentered.current = false;
  };

  const choose = (option: ComboboxOption | undefined) => {
    if (!option) return;
    onValueChange(option.value);
    setOpen(false);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery('');
      const index = Math.max(
        0,
        options.findIndex((o) => o.value === value),
      );
      setActive(index);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    stopCentering();
    const page = 8;
    const moves: Partial<Record<string, number>> = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      PageDown: active + page,
      PageUp: active - page,
    };
    const target = moves[event.key];
    if (target !== undefined) {
      event.preventDefault();
      moveTo(target);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(filtered[active]);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-haspopup="listbox"
          className={cn(
            'glass-chip text-ink rounded-control flex h-10 w-full cursor-pointer items-center justify-between gap-2 px-3 text-left text-sm',
            'hover:border-hair-strong focus-visible:border-ring focus-visible:outline-none',
            'focus-visible:shadow-[inset_0_1px_0_var(--sb-spec),0_0_0_3px_var(--sb-ring-glow)]',
            'aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          {...buttonProps}
        >
          <span className={cn('flex min-w-0 flex-1 items-center gap-2', !selected && 'text-ink-3')}>
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            {selected?.hint && (
              <span className="text-ink-3 ml-auto shrink-0 text-xs tabular-nums">
                {selected.hint}
              </span>
            )}
          </span>
          <ChevronDown className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          // Radix then focuses the search box; show the current choice, which may be far down.
          onOpenAutoFocus={() => {
            keepCentered.current = true;
            requestAnimationFrame(() => {
              if (listRef.current) centerSelected(listRef.current);
            });
          }}
          className={cn(
            'glass-float z-50 flex w-(--radix-popover-trigger-width) min-w-64 flex-col overflow-hidden rounded-[14px]',
            'max-h-[min(22rem,var(--radix-popover-content-available-height,22rem))]',
            'origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          )}
        >
          <div className="border-hair flex items-center gap-2 border-b px-3">
            <Search className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
            <input
              role="combobox"
              aria-label={searchLabel}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              {...(filtered[active] ? { 'aria-activedescendant': optionId(active) } : {})}
              placeholder={searchLabel}
              value={query}
              onChange={(e) => {
                stopCentering();
                setQuery(e.target.value);
                setActive(0);
                listRef.current?.scrollTo({ top: 0 });
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
              className="text-ink placeholder:text-ink-3 h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div
            ref={observeList}
            id={listId}
            onWheel={stopCentering}
            onTouchMove={stopCentering}
            onPointerDown={stopCentering}
            role="listbox"
            aria-label={searchLabel}
            className="overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <p className="text-ink-3 px-2.5 py-6 text-center text-sm">{emptyText}</p>
            ) : (
              filtered.map((option, index) => (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.value === value}
                  data-active={index === active ? '' : undefined}
                  // Keep focus in the search box; the click still picks the option.
                  onPointerDown={(e) => {
                    e.preventDefault();
                  }}
                  onPointerMove={() => {
                    if (index !== active) setActive(index);
                  }}
                  onClick={() => {
                    choose(option);
                  }}
                  className={cn(
                    'text-ink relative flex h-9 cursor-pointer items-center gap-2 rounded-lg pr-8 pl-2.5 text-sm select-none',
                    'data-[active]:bg-chip',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.hint && (
                    <span className="text-ink-3 ml-auto shrink-0 text-xs tabular-nums">
                      {option.hint}
                    </span>
                  )}
                  {option.value === value && (
                    <Check className="text-ring absolute right-2.5 size-4" aria-hidden="true" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
