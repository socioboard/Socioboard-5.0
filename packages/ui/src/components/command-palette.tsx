import { Search } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import {
  useId,
  useMemo,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../cn';
import { matchesAll, searchWords } from '../search';
import { DialogOverlay } from './dialog';

export interface Command {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  /** Shown on the right: a shortcut, "Current", a role. */
  hint?: string;
  /** Extra words the search matches (synonyms: "schedule" for Calendar). */
  keywords?: string;
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  commands: readonly Command[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: readonly CommandGroup[];
  /** Accessible title of the dialog, and the search box's label and placeholder. */
  title: string;
  searchLabel: string;
  emptyText: ReactNode;
}

/**
 * ⌘K: a search box over grouped commands (go to a page, switch workspace, change theme). Typing
 * filters every group, arrows move across groups, Enter runs the command and closes.
 */
export function CommandPalette({ open, onOpenChange, title, ...body }: CommandPaletteProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'glass-float rounded-pane fixed top-[12dvh] left-1/2 z-50 flex max-h-[min(28rem,76dvh)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden',
            'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out motion-reduce:animate-none',
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {/* Mounted only while open, so every opening starts with an empty search. */}
          <PaletteBody
            {...body}
            close={() => {
              onOpenChange(false);
            }}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function PaletteBody({
  groups,
  searchLabel,
  emptyText,
  close,
}: Pick<CommandPaletteProps, 'groups' | 'searchLabel' | 'emptyText'> & { close: () => void }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const visible = useMemo(() => {
    const words = searchWords(query);
    return groups
      .map((group) => ({
        ...group,
        commands: group.commands.filter((c) =>
          matchesAll(`${c.label} ${c.hint ?? ''} ${c.keywords ?? ''} ${group.heading}`, words),
        ),
      }))
      .filter((group) => group.commands.length > 0);
  }, [groups, query]);
  const flat = visible.flatMap((group) => group.commands);
  const optionId = (index: number) => `${listId}-${String(index)}`;

  const run = (command: Command | undefined) => {
    if (!command) return;
    close();
    command.onSelect();
  };

  const moveTo = (index: number) => {
    if (flat.length === 0) return;
    const next = (index + flat.length) % flat.length; // wraps, like Spotlight and Raycast
    setActive(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveTo(active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(flat[active]);
    }
  };

  let index = -1;
  return (
    <>
      <div className="border-hair flex items-center gap-3 border-b px-4">
        <Search className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
        <input
          role="combobox"
          aria-label={searchLabel}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          {...(flat[active] ? { 'aria-activedescendant': optionId(active) } : {})}
          placeholder={searchLabel}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="text-ink placeholder:text-ink-3 h-13 min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
      </div>
      <div
        id={listId}
        role="listbox"
        aria-label={searchLabel}
        className="overflow-y-auto overscroll-contain p-1.5"
      >
        {visible.length === 0 ? (
          <p className="text-ink-3 px-3 py-8 text-center text-sm">{emptyText}</p>
        ) : (
          visible.map((group) => (
            <div key={group.heading} role="group" aria-label={group.heading}>
              <div
                className="text-ink-3 px-2.5 pt-2.5 pb-1 text-xs font-semibold"
                aria-hidden="true"
              >
                {group.heading}
              </div>
              {group.commands.map((command) => {
                index += 1;
                const at = index;
                const Icon = command.icon;
                return (
                  <div
                    key={command.id}
                    id={optionId(at)}
                    role="option"
                    aria-selected={at === active}
                    data-active={at === active ? '' : undefined}
                    onPointerDown={(e) => {
                      e.preventDefault(); // keep focus in the search box
                    }}
                    onPointerMove={() => {
                      if (at !== active) setActive(at);
                    }}
                    onClick={() => {
                      run(command);
                    }}
                    className="text-ink data-[active]:bg-chip flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm select-none"
                  >
                    {Icon && <Icon className="text-ink-3 size-4 shrink-0" />}
                    <span className="truncate">{command.label}</span>
                    {command.hint && (
                      <span className="text-ink-3 ml-auto shrink-0 pl-3 text-xs">
                        {command.hint}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </>
  );
}
