import type { Post, PostStatus, PostTarget, TargetStatus } from '@socioboard/contracts';
import { Avatar, cn, NetworkIcon, networkName, StatusChip, Tooltip } from '@socioboard/ui';
import { Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WorkspaceTime } from '../../../lib/workspace-time';

/** A post's or a delivery's status, in the app's language, with the app-wide colors. */
export function PostStatusChip({
  status,
  className,
}: {
  status: PostStatus | TargetStatus;
  className?: string | undefined;
}) {
  const { t } = useTranslation('posts');
  return <StatusChip status={status} label={t(`status.${status}`)} className={className} />;
}

/** An account as a small avatar with its network's mark on the corner. */
export function AccountAvatar({
  account,
  size = 'sm',
  decorative = false,
}: {
  account: PostTarget['account'];
  size?: 'sm' | 'md';
  decorative?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar
        name={account.displayName}
        src={account.avatarUrl}
        size={size === 'md' ? 'lg' : 'sm'}
        decorative={decorative}
        className={cn(account.status === 'disconnected' && 'opacity-50 grayscale')}
      />
      <NetworkIcon
        network={account.network}
        variant="tile"
        size="xs"
        decorative
        className="ring-canvas absolute -right-1 -bottom-1 ring-2"
      />
    </span>
  );
}

const STACK = 4;

/** The accounts a post goes to, overlapping; names on hover and for screen readers. */
export function AccountStack({ targets }: { targets: PostTarget[] }) {
  const { t } = useTranslation('posts');
  const live = targets.filter((x) => x.status !== 'cancelled');
  if (live.length === 0) return <span className="text-ink-3 text-xs">{t('noAccounts')}</span>;
  const names = live.map((x) => `${x.account.displayName} (${networkName(x.account.network)})`);
  const shown = live.slice(0, STACK);
  return (
    <Tooltip content={names.join(', ')}>
      <span className="flex items-center" tabIndex={-1}>
        <span className="sr-only">{names.join(', ')}</span>
        <span className="flex items-center -space-x-1.5" aria-hidden="true">
          {shown.map((x) => (
            <span key={x.id} className="ring-canvas rounded-full ring-2">
              <AccountAvatar account={x.account} decorative />
            </span>
          ))}
        </span>
        {live.length > STACK && (
          <span className="text-ink-3 ml-2 text-xs tabular-nums" aria-hidden="true">
            {t('moreAccounts', { count: live.length - STACK })}
          </span>
        )}
      </span>
    </Tooltip>
  );
}

/**
 * The one time that matters for a post in a list: when it went out, when it's due, or when it
 * was started.
 */
function postWhen(post: Post): { key: 'published' | 'scheduled' | 'created'; at: string } {
  const published = post.targets
    .map((x) => x.publishedAt)
    .filter((x): x is string => x !== null)
    .sort();
  const last = published.at(-1);
  if (last) return { key: 'published', at: last };
  const scheduled = post.targets
    .map((x) => x.scheduledAt)
    .filter((x): x is string => x !== null)
    .sort()[0];
  if (post.status === 'scheduled' && scheduled) return { key: 'scheduled', at: scheduled };
  return { key: 'created', at: post.createdAt };
}

/** Marks a post that repeats (the template) or that a repeating post made (a copy). */
export function RepeatMark({ recurring }: { recurring: Post['recurring'] }) {
  const { t } = useTranslation('posts');
  if (!recurring) return null;
  return (
    <span className="flex items-center gap-1">
      <Repeat className="size-3.5" aria-hidden="true" />
      {t(`repeat.${recurring}`)}
    </span>
  );
}

export function PostWhen({ post }: { post: Post }) {
  const { t } = useTranslation('posts');
  if (post.status === 'publishing') {
    return <span className="text-ink-2 text-[13px]">{t('when.sending')}</span>;
  }
  const when = postWhen(post);
  return (
    <WorkspaceTime iso={when.at} className="text-ink-2 text-[13px] whitespace-nowrap">
      {(time) => t(`when.${when.key}`, { time })}
    </WorkspaceTime>
  );
}
