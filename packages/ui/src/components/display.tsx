import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '../cn';

/** A loading placeholder shaped like the content it stands in for. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-shimmer rounded-lg bg-[length:200%_100%]',
        'bg-[linear-gradient(90deg,var(--sb-chip)_25%,var(--sb-hair-strong)_50%,var(--sb-chip)_75%)]',
        className,
      )}
      {...props}
    />
  );
}

const avatarSizes = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
  xl: 'size-14 text-lg',
} as const;

// Soft Aurora tints with dark text: readable (4.5:1+) in both themes.
const avatarColors = [
  'bg-[#f3d5dd] text-[#7a1f3a]',
  'bg-[#e0d8fb] text-[#43308f]',
  'bg-[#d2efe6] text-[#155a45]',
  'bg-[#f5e3c8] text-[#6b4a10]',
  'bg-[#fbdccf] text-[#7c2d14]',
  'bg-[#dfe3ea] text-[#2f3644]',
];

/** First letters of the first and last word: "Priya Raman" → "PR". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '?';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** The same name always gets the same color. */
function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return avatarColors[Math.abs(hash) % avatarColors.length] ?? '';
}

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof avatarSizes;
  /** The name is already shown next to it: hide the avatar from screen readers (no double read). */
  decorative?: boolean;
  className?: string;
}

/** A photo when there is one; otherwise initials on a color picked from the name. */
export function Avatar({ name, src, size = 'md', decorative = false, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      {...(decorative ? { 'aria-hidden': true } : {})}
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full font-semibold select-none',
        avatarSizes[size],
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          // Shown once loaded (Radix waits), so it fades in over the initials.
          className="animate-fade-in size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={cn('flex size-full items-center justify-center', colorFor(name))}
        // Only a photo that fails needs a delay; without one, show initials at once.
        {...(src ? { delayMs: 300 } : {})}
      >
        <span aria-hidden="true">{initials(name)}</span>
        {!decorative && <span className="sr-only">{name}</span>}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export const badgeVariants = cva(
  'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold whitespace-nowrap transition-[background-color,color,border-color] duration-300',
  {
    variants: {
      tone: {
        neutral: 'glass-chip text-ink-2',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning-tint text-warning',
        danger: 'bg-danger-tint text-danger',
        accent: 'bg-ring/15 text-ring',
        outline: 'border border-dashed border-hair-strong text-ink-3',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  /** A small dot in the badge's color, for statuses. */
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  /** What the person can do next, in plain words. */
  description?: ReactNode;
  /** Usually one primary Button. */
  action?: ReactNode;
  className?: string;
}

/** An empty view is an invitation to act: say what goes here and how to add the first one. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'stagger-children flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="glass-chip text-ink-2 flex size-12 items-center justify-center rounded-[14px] [&_svg]:size-5">
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-ink text-base font-semibold tracking-tight">{title}</h3>
        {description && <p className="text-ink-2 text-sm leading-relaxed">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
