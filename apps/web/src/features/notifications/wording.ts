import { NetworkId, type Notification } from '@socioboard/contracts';
import { networkName } from '@socioboard/ui';
import { useTranslation } from 'react-i18next';

/** How important a notification is: failures interrupt (a toast), the rest wait in the bell. */
export const URGENT = new Set<Notification['type']>(['publish_failed', 'account_reauth_required']);

/**
 * A notification in the reader's language, from its type and params (docs/frontend/areas/
 * notifications.md); the server's English `title` and `body` stand in for a type this version
 * doesn't know, or params it can't read. The body is the network's own reason where there is one.
 */
export function useNotificationWording() {
  const { t } = useTranslation('notifications');
  return (n: Notification): { title: string; body: string } => {
    const network = NetworkId.safeParse(n.params.network);
    const name = network.success ? networkName(network.data) : null;
    switch (n.type) {
      case 'publish_failed':
        return name
          ? { title: t('types.publish_failed.title', { network: name }), body: n.body }
          : n;
      case 'post_published':
        return name
          ? {
              title: t('types.post_published.title', { network: name }),
              body: t('types.post_published.body', { network: name }),
            }
          : n;
      case 'account_reauth_required': {
        const account = typeof n.params.account === 'string' ? n.params.account : null;
        return account
          ? { title: t('types.account_reauth_required.title', { account }), body: n.body }
          : n;
      }
      default:
        return n;
    }
  };
}

/** "Just now", "5 min ago", "3 h ago", "Yesterday", then the date. */
export function relativeTime(iso: string, now: number, locale?: string): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const abs = Math.abs(seconds);
  if (abs < 45) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(seconds / 86_400), 'day');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso));
}
