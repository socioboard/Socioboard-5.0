import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '../cn';
import { Spinner } from './spinner';

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold select-none',
    // Hovers ease in; a press gives a little (scale), faster going down than coming back.
    'transition-[background-color,box-shadow,filter,color,transform] duration-150 ease-out-soft',
    'not-disabled:active:scale-[0.97] not-disabled:active:duration-75 motion-reduce:active:scale-100',
    // Disabled: dimmed, the not-allowed cursor, and no hover change (so it doesn't look clickable).
    'disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /** The one main action on a screen: lit brand orange. */
        primary: 'accent-lit not-disabled:hover:brightness-105 not-disabled:active:brightness-95',
        /** Everything else: frosted chip. */
        secondary: 'glass-chip text-ink not-disabled:hover:bg-glass-solid',
        /** Low emphasis, in toolbars and lists. */
        ghost: 'text-ink-2 not-disabled:hover:bg-chip not-disabled:hover:text-ink',
        /** Deletes or removes something; pair with a confirmation. */
        danger:
          'bg-danger-solid text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] not-disabled:hover:brightness-110',
      },
      size: {
        sm: 'h-8 rounded-lg px-3 text-[13px]',
        md: 'h-9 rounded-control px-3.5 text-[13px]',
        lg: 'h-11 rounded-control px-5 text-sm',
        /** Icon-only: give it an aria-label. */
        icon: 'size-9 rounded-control',
        'icon-sm': 'size-8 rounded-lg',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a router Link) with button styles instead of a <button>. */
  asChild?: boolean;
  /** Shows a spinner and blocks clicks until the action finishes. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      // A button inside a form submits unless told otherwise; default to "button".
      type={type ?? 'button'}
      className={classes}
      disabled={Boolean(disabled) || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
