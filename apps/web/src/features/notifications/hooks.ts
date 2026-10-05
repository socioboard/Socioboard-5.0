import type { Notification } from '@socioboard/contracts';
import { toast } from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '../../lib/i18n';
import { bellQuery, markRead } from './api';
import { URGENT, useNotificationWording } from './wording';

/** Opening a notification: it's read now, and its page opens (a path inside the app). */
export function useOpenNotification(after?: () => void) {
  const client = useQueryClient();
  const navigate = useNavigate();
  return (n: Notification) => {
    if (n.readAt === null) {
      markRead(client, n.id).catch((err: unknown) => {
        toast.error(errorMessage(err));
      });
    }
    after?.();
    if (n.link) void navigate({ href: n.link });
  };
}

/** The clock for "5 min ago", moving once a minute. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(timer);
    };
  }, [intervalMs]);
  return now;
}

/**
 * While the app is open, a post that couldn't go out or an account that needs reconnecting pops
 * up as a toast, once, with the way to it. Only what arrives after the app opened: what was there
 * already waits in the bell.
 */
export function useNotificationToasts() {
  const { t } = useTranslation('notifications');
  const word = useNotificationWording();
  const open = useOpenNotification();
  const bell = useQuery(bellQuery);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const items = bell.data?.items;
    if (!items) return;
    if (seen.current === null) {
      seen.current = new Set(items.map((n) => n.id));
      return;
    }
    const fresh = items.filter((n) => !seen.current?.has(n.id));
    for (const n of fresh) seen.current.add(n.id);
    // Oldest first, so the newest ends up on top of the stack.
    for (const n of fresh.reverse()) {
      if (!URGENT.has(n.type) || n.readAt !== null) continue;
      const { title, body } = word(n);
      toast.error(title, {
        // One toast per notification, however often it is seen.
        id: n.id,
        description: body,
        duration: 10_000,
        ...(n.link
          ? {
              action: {
                label: t('toast.open'),
                onClick: () => {
                  open(n);
                },
              },
            }
          : {}),
      });
    }
    // Only new data matters; the wording and opener change with the language and the router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bell.data]);
}

/** The browser tab says how many are unread: "(3) Socioboard". */
export function useUnreadTitle() {
  const count = useQuery(bellQuery).data?.unreadCount ?? 0;
  const base = useRef<string | null>(null);
  useEffect(() => {
    base.current ??= document.title.replace(/^\(\d+\+?\) /, '');
    document.title =
      count > 0 ? `(${count > 99 ? '99+' : String(count)}) ${base.current}` : base.current;
  }, [count]);
  useEffect(
    () => () => {
      if (base.current) document.title = base.current;
    },
    [],
  );
}
