import {
  FEED_TYPES,
  apiRoutes,
  type NotificationPreference,
  type NotificationPreferences,
  type NotificationType,
} from '@socioboard/contracts';
import {
  AnimatePresence,
  Button,
  cn,
  EmptyState,
  listItem,
  motion,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  springs,
  Switch,
  toast,
} from '@socioboard/ui';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { SettingsSection } from '../../settings';
import {
  bellQuery,
  markAllRead,
  notificationKeys,
  notificationListQuery,
  preferencesQuery,
  type NotificationFilter,
} from '../api';
import { useNow, useOpenNotification } from '../hooks';
import { NotificationItem } from './notification-item';

export interface NotificationsSearch {
  unread?: boolean | undefined;
  type?: NotificationType | undefined;
}

/**
 * `/me/notifications` (docs/frontend/areas/notifications.md): every notification, newest first,
 * filtered to unread or one kind, and which ones arrive in the app and by email.
 */
export function NotificationsPage({
  search,
  onSearchChange,
}: {
  search: NotificationsSearch;
  onSearchChange: (patch: Partial<NotificationsSearch>) => void;
}) {
  const { t } = useTranslation('notifications');
  return (
    <>
      <SettingsSection
        title={t('page.feed')}
        description={t('page.feedBody')}
        headingId="notifications-feed"
      >
        <Feed search={search} onSearchChange={onSearchChange} />
      </SettingsSection>
      <SettingsSection
        title={t('page.preferences')}
        description={t('page.preferencesBody')}
        headingId="notification-preferences"
      >
        <Preferences />
      </SettingsSection>
    </>
  );
}

function Feed({
  search,
  onSearchChange,
}: {
  search: NotificationsSearch;
  onSearchChange: (patch: Partial<NotificationsSearch>) => void;
}) {
  const { t } = useTranslation('notifications');
  const client = useQueryClient();
  const filter: NotificationFilter = { unread: search.unread ?? false, type: search.type ?? null };
  const list = useInfiniteQuery(notificationListQuery(filter));
  const unreadCount =
    useQuery(bellQuery).data?.unreadCount ?? list.data?.pages[0]?.unreadCount ?? 0;
  const now = useNow();
  const open = useOpenNotification();
  const [marking, setMarking] = useState(false);
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = filter.unread || filter.type !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label={t('page.show')}
          className="glass-chip flex rounded-control p-1"
        >
          {([false, true] as const).map((unread) => {
            const on = filter.unread === unread;
            return (
              <button
                key={String(unread)}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  onSearchChange({ unread: unread || undefined });
                }}
                className={cn(
                  'relative isolate h-7 cursor-pointer rounded-lg px-3 text-[13px] font-medium transition-colors duration-200',
                  on ? 'text-ink' : 'text-ink-3 hover:text-ink',
                )}
              >
                {on && (
                  <motion.span
                    layoutId="notifications-filter"
                    aria-hidden="true"
                    className="bg-chip absolute inset-0 -z-10 rounded-lg shadow-sm"
                    transition={springs.snappy}
                  />
                )}
                {unread ? t('page.unread', { count: unreadCount }) : t('page.all')}
              </button>
            );
          })}
        </div>
        <Select
          value={filter.type ?? 'all'}
          onValueChange={(v) => {
            onSearchChange({ type: v === 'all' ? undefined : (v as NotificationType) });
          }}
        >
          <SelectTrigger aria-label={t('page.type')} className="h-9 w-auto min-w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('page.allTypes')}</SelectItem>
            {FEED_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`types.${type}.name`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
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

      <div className="glass-chip rounded-pane p-1.5">
        {list.isPending ? (
          <div className="flex flex-col gap-2 p-2" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="flex flex-col items-start gap-2 p-3">
            <p className="text-ink-2 text-sm">{t('loadError')}</p>
            <Button size="sm" onClick={() => void list.refetch()}>
              {t('retry')}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<BellOff />}
            title={filtered ? t('page.emptyFiltered') : t('empty.title')}
            description={filtered ? t('page.emptyFilteredBody') : t('page.emptyBody')}
            {...(filtered
              ? {
                  action: (
                    <Button
                      onClick={() => {
                        onSearchChange({ unread: undefined, type: undefined });
                      }}
                    >
                      {t('page.showAll')}
                    </Button>
                  ),
                }
              : {})}
          />
        ) : (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {items.map((n, i) => (
                <motion.li key={n.id} {...listItem(i)}>
                  <NotificationItem notification={n} now={now} onOpen={open} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        {list.hasNextPage && (
          <div className="flex justify-center p-2">
            <Button
              size="sm"
              loading={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
            >
              {t('page.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const CHANNELS = ['inApp', 'email'] as const;

/** Each kind, and whether it arrives in the app and by email; a switch applies at once. */
function Preferences() {
  const { t } = useTranslation('notifications');
  const client = useQueryClient();
  const prefs = useQuery(preferencesQuery);
  const id = useId();
  const [saving, setSaving] = useState<string | null>(null);

  const change = async (
    type: NotificationType,
    channel: (typeof CHANNELS)[number],
    on: boolean,
  ) => {
    const before = client.getQueryData<NotificationPreferences>(notificationKeys.preferences);
    // Shown at once; put back if the server says no.
    client.setQueryData<NotificationPreferences>(notificationKeys.preferences, (old) =>
      old ? { items: old.items.map((p) => (p.type === type ? { ...p, [channel]: on } : p)) } : old,
    );
    setSaving(`${type}:${channel}`);
    try {
      const saved = await api(apiRoutes.notifications.updateNotificationPreferences, {
        body: { items: [{ type, [channel]: on }] },
      });
      client.setQueryData(notificationKeys.preferences, saved);
    } catch (err) {
      client.setQueryData(notificationKeys.preferences, before);
      toast.error(errorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  if (prefs.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }
  if (prefs.isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-ink-2 text-sm">{t('preferences.loadError')}</p>
        <Button size="sm" onClick={() => void prefs.refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }
  return (
    <div
      className="glass-chip rounded-pane overflow-hidden"
      role="table"
      aria-label={t('page.preferences')}
    >
      <div
        role="row"
        className="border-hair grid grid-cols-[1fr_4.5rem_4.5rem] items-center gap-2 border-b px-4 py-2"
      >
        <span role="columnheader" className="text-ink-3 text-xs font-semibold">
          {t('preferences.kind')}
        </span>
        {CHANNELS.map((c) => (
          <span
            key={c}
            role="columnheader"
            className="text-ink-3 text-center text-xs font-semibold"
          >
            {t(`preferences.${c}`)}
          </span>
        ))}
      </div>
      {prefs.data.items.map((p: NotificationPreference) => (
        <div
          key={p.type}
          role="row"
          className="border-hair grid grid-cols-[1fr_4.5rem_4.5rem] items-center gap-2 border-b px-4 py-3 last:border-b-0"
        >
          <span role="rowheader" className="flex flex-col gap-0.5">
            <span id={`${id}-${p.type}`} className="text-ink text-sm font-medium">
              {t(`types.${p.type}.name`)}
            </span>
            <span className="text-ink-3 text-xs leading-relaxed">
              {t(`types.${p.type}.description`)}
            </span>
          </span>
          {CHANNELS.map((c) => (
            <span key={c} role="cell" className="flex justify-center">
              {p[c] === null ? (
                <span className="text-ink-3 text-xs" aria-label={t('preferences.notOffered')}>
                  –
                </span>
              ) : (
                <Switch
                  checked={p[c]}
                  disabled={saving === `${p.type}:${c}`}
                  aria-label={t(`preferences.${c}For`, { kind: t(`types.${p.type}.name`) })}
                  onCheckedChange={(on) => void change(p.type, c, on)}
                />
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
