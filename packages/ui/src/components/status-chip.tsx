import type { PostStatus, TargetStatus } from '@socioboard/contracts';

import { cn } from '../cn';
import { Badge, type BadgeProps } from './display';

type Status = PostStatus | TargetStatus;

/**
 * One mapping for post and delivery statuses, used everywhere (docs/frontend/design-system.md):
 * published green, scheduled neutral, failed red, needs approval amber, draft dashed.
 */
const STATUS: Record<
  Status,
  { tone: NonNullable<BadgeProps['tone']>; label: string; live?: boolean }
> = {
  draft: { tone: 'outline', label: 'Draft' },
  in_review: { tone: 'warning', label: 'In review' },
  approved: { tone: 'neutral', label: 'Approved' },
  scheduled: { tone: 'neutral', label: 'Scheduled' },
  publishing: { tone: 'accent', label: 'Publishing', live: true },
  published: { tone: 'success', label: 'Published' },
  partial: { tone: 'warning', label: 'Partly published' },
  failed: { tone: 'danger', label: 'Failed' },
  pending: { tone: 'outline', label: 'Waiting' },
  cancelled: { tone: 'outline', label: 'Cancelled' },
};

export interface StatusChipProps {
  status: Status;
  /** The status in the app's language; defaults to English. */
  label?: string;
  className?: string | undefined;
}

export function StatusChip({ status, label, className }: StatusChipProps) {
  const s = STATUS[status];
  return (
    <Badge
      tone={s.tone}
      className={cn('relative', status === 'cancelled' && 'line-through', className)}
      data-status={status}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {/* Publishing: a quiet pulse says it's happening now (off under reduced motion). */}
        {s.live && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
        )}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      {label ?? s.label}
    </Badge>
  );
}
