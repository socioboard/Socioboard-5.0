import {
  AnimatePresence,
  Button,
  cn,
  listItem,
  motion,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  springs,
  toast,
  Tooltip,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, CheckCheck, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '../../../lib/i18n';
import { bellQuery, markAllRead } from '../api';
import { useNow, useOpenNotification } from '../hooks';
import { NotificationItem } from './notification-item';

/** The unread count on the bell: up to 9, then "9+". */
export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key="badge"
          aria-hidden="true"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: springs.momentum }}
          exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
          className={cn(
            'accent-lit absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums',
            className,
          )}
        >
          {/* A new count pops in. */}
          <motion.span
            key={count}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: springs.snappy }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/**
 * The bell (docs/frontend/areas/notifications.md): the unread count on it, and a panel with the
 * latest 20, unread first, "Mark all read" and the way to the full list.
 */
export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation('notifications');
  const bell = useQuery(bellQuery);
  const [open, setOpen] = useState(false);
  const count = bell.data?.unreadCount ?? 0;
  const label = count > 0 ? t('bell.labelUnread', { count }) : t('bell.label');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content={label} side={compact ? 'right' : 'bottom'}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(
              'glass-chip text-ink-2 hover:text-ink relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control',
              'transition-colors duration-150 data-[state=open]:text-ink',
            )}
          >
            <motion.span
              // A new unread notification rings the bell once.
              key={count}
              initial={count > 0 ? { rotate: -18 } : false}
              animate={{ rotate: 0, transition: { type: 'spring', stiffness: 520, damping: 9 } }}
              className="inline-flex"
            >
              <Bell className="size-4" aria-hidden="true" />
            </motion.span>
            <UnreadBadge count={count} className="-top-1 -right-1" />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        align="start"
        side={compact ? 'right' : 'bottom'}
        className="flex max-h-[min(560px,calc(100dvh-4rem))] w-[min(380px,calc(100vw-2rem))] flex-col p-0"
      >
        <BellPanel
          close={() => {
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function BellPanel({ close }: { close: () => void }) {
  const { t } = useTranslation('notifications');
  const client = useQueryClient();
  const bell = useQuery(bellQuery);
  const now = useNow();
  const open = useOpenNotification(close);
  const [marking, setMarking] = useState(false);
  // Unread first, each part newest first (the order the server gives).
  const items = [...(bell.data?.items ?? [])].sort(
    (a, b) => Number(a.readAt !== null) - Number(b.readAt !== null),
  );
  const unread = bell.data?.unreadCount ?? 0;
  return (
    <>
      <div className="border-hair flex items-center gap-2 border-b px-4 py-3">
        <h2 className="text-ink flex-1 text-sm font-semibold">{t('title')}</h2>
        {unread > 0 && (
          <Button
            size="sm"
            variant="ghost"
            loading={marking}
            onClick={() => {
              setMarking(true);
              markAllRead(client)
                .catch((err: unknown) => {
                  toast.error(errorMessage(err));
                })
                .finally(() => {
                  setMarking(false);
                });
            }}
          >
            <CheckCheck aria-hidden="true" />
            {t('markAllRead')}
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {bell.isPending ? (
          <div className="flex flex-col gap-2 p-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : bell.isError ? (
          <div className="flex flex-col items-start gap-2 p-3">
            <p className="text-ink-2 text-sm">{t('loadError')}</p>
            <Button size="sm" onClick={() => void bell.refetch()}>
              {t('retry')}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <PartyPopper className="text-ink-3 size-6" aria-hidden="true" />
            <p className="text-ink text-sm font-medium">{t('empty.title')}</p>
            <p className="text-ink-3 text-xs">{t('empty.body')}</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {items.map((n, i) => (
                <motion.li key={n.id} {...listItem(i)}>
                  <NotificationItem notification={n} now={now} onOpen={open} compact />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <div className="border-hair border-t p-1.5">
        <Link
          to="/me/notifications"
          onClick={close}
          className="text-ink-2 hover:bg-chip hover:text-ink flex h-9 items-center justify-center rounded-[10px] text-[13px] font-medium"
        >
          {t('seeAll')}
        </Link>
      </div>
    </>
  );
}
