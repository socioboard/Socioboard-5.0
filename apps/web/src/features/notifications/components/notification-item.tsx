import type { Notification } from '@socioboard/contracts';
import { cn } from '@socioboard/ui';
import { CircleCheck, PlugZap, TriangleAlert, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { relativeTime, useNotificationWording } from '../wording';

const ICONS = {
  publish_failed: { icon: TriangleAlert, tone: 'text-danger bg-danger-tint' },
  post_published: { icon: CircleCheck, tone: 'text-success bg-chip' },
  account_reauth_required: { icon: PlugZap, tone: 'text-warning bg-warning-tint' },
  digest: { icon: Bell, tone: 'text-ink-2 bg-chip' },
} as const;

/**
 * One notification: what happened (a mark by kind), in which workspace and when, unread marked
 * with a dot. A button: opening it marks it read and goes to its page.
 */
export function NotificationItem({
  notification: n,
  now,
  onOpen,
  compact = false,
}: {
  notification: Notification;
  now: number;
  onOpen: (n: Notification) => void;
  compact?: boolean;
}) {
  const { t, i18n } = useTranslation('notifications');
  const word = useNotificationWording();
  const { title, body } = word(n);
  const { icon: Icon, tone } = ICONS[n.type];
  const unread = n.readAt === null;
  return (
    <button
      type="button"
      onClick={() => {
        onOpen(n);
      }}
      data-unread={unread || undefined}
      className={cn(
        'group relative flex w-full cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5 text-left',
        'hover:bg-chip transition-colors duration-150',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
      )}
    >
      <span
        className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', tone)}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('text-ink text-[13px] leading-snug', unread && 'font-semibold')}>
          {unread && <span className="sr-only">{t('unread')} </span>}
          {title}
        </span>
        {body && (
          <span
            className={cn(
              'text-ink-2 text-xs leading-relaxed wrap-break-word',
              compact ? 'line-clamp-2' : 'line-clamp-3',
            )}
          >
            {body}
          </span>
        )}
        <span className="text-ink-3 text-[11px]">
          {[n.workspace?.name, relativeTime(n.createdAt, now, i18n.language)]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      {unread && (
        <span
          aria-hidden="true"
          className="bg-accent mt-2 size-2 shrink-0 rounded-full shadow-[0_0_0_3px_color-mix(in_srgb,var(--sb-accent)_18%,transparent)]"
        />
      )}
    </button>
  );
}
