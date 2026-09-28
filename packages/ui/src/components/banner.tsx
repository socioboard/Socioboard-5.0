import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../cn';

const bannerVariants = cva(
  'glass-chip flex items-start gap-3 rounded-control px-3.5 py-2.5 text-sm leading-relaxed',
  {
    variants: {
      tone: {
        info: '[&>svg]:text-ring',
        warning: 'bg-warning-tint [&>svg]:text-warning',
        danger: 'bg-danger-tint [&>svg]:text-danger',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

const icons = { info: Info, warning: TriangleAlert, danger: CircleAlert };

export interface BannerProps extends VariantProps<typeof bannerVariants> {
  children: ReactNode;
  /** A button or link, e.g. "Resend link", "Reconnect". */
  action?: ReactNode;
  /** Shows a close button; omit for banners that must stay (payment failed). */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

/**
 * A notice across the top of the content (email not verified, account needs reconnecting).
 * Announced politely; `danger` interrupts (role="alert").
 */
export function Banner({
  tone,
  children,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
}: BannerProps) {
  const Icon = icons[tone ?? 'info'];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(bannerVariants({ tone }), className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-ink">{children}</span>
        {action}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="text-ink-3 hover:bg-chip hover:text-ink -my-1 -mr-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
