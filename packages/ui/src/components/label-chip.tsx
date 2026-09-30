import type { LabelColor } from '@socioboard/contracts';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../cn';

/**
 * Post label colours (docs/frontend/design-system.md, "Label colours"): the API stores a name;
 * each maps to a tinted chip whose text meets contrast in both themes, and a solid swatch.
 */
export const LABEL_COLORS: Record<LabelColor, { chip: string; swatch: string }> = {
  gray: {
    chip: 'bg-zinc-500/12 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-200',
    swatch: 'bg-zinc-500 dark:bg-zinc-400',
  },
  red: {
    chip: 'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-300',
    swatch: 'bg-red-500 dark:bg-red-400',
  },
  orange: {
    chip: 'bg-orange-500/12 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300',
    swatch: 'bg-orange-500 dark:bg-orange-400',
  },
  amber: {
    chip: 'bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
    swatch: 'bg-amber-500 dark:bg-amber-400',
  },
  green: {
    chip: 'bg-green-500/12 text-green-800 dark:bg-green-400/15 dark:text-green-300',
    swatch: 'bg-green-600 dark:bg-green-400',
  },
  teal: {
    chip: 'bg-teal-500/12 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300',
    swatch: 'bg-teal-600 dark:bg-teal-400',
  },
  blue: {
    chip: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
    swatch: 'bg-blue-500 dark:bg-blue-400',
  },
  indigo: {
    chip: 'bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
    swatch: 'bg-indigo-500 dark:bg-indigo-400',
  },
  violet: {
    chip: 'bg-violet-500/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300',
    swatch: 'bg-violet-500 dark:bg-violet-400',
  },
  pink: {
    chip: 'bg-pink-500/12 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300',
    swatch: 'bg-pink-500 dark:bg-pink-400',
  },
};

export const LABEL_COLOR_NAMES = Object.keys(LABEL_COLORS) as LabelColor[];

export interface LabelChipProps extends Omit<ComponentProps<'span'>, 'color'> {
  name: string;
  color: LabelColor;
  /** Shows a remove button (a label picker's chosen labels). */
  onRemove?: () => void;
  removeLabel?: string;
}

/** A post label: its name on its colour. */
export function LabelChip({
  name,
  color,
  onRemove,
  removeLabel,
  className,
  ...props
}: LabelChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-48 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold',
        LABEL_COLORS[color].chip,
        onRemove && 'pr-1',
        className,
      )}
      data-color={color}
      {...props}
    >
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${name}`}
          className="-my-1 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded opacity-70 hover:bg-current/15 hover:opacity-100 disabled:cursor-not-allowed"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

/** A label colour on its own: the dot in pickers and menus. */
export function LabelSwatch({ color, className }: { color: LabelColor; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-full',
        LABEL_COLORS[color].swatch,
        className,
      )}
      aria-hidden="true"
    />
  );
}
