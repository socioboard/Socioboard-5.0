import { apiRoutes, type PostDetails, type PublishAttempt } from '@socioboard/contracts';
import { Button, Card, cn, networkName, toast } from '@socioboard/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronDown, ExternalLink, RotateCw } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { postKeys, rememberPost } from '../api';
import { AccountAvatar, PostStatusChip } from './post-bits';

type Target = PostDetails['targets'][number];

/**
 * One account a post goes to (docs/frontend/areas/posts.md, `TargetRow`): its status, the link to
 * the post on the network, and when it failed, why in plain words with the way to fix it (retry,
 * reconnect the account, or edit the post), then its publishing history.
 */
export function TargetCard({
  postId,
  target,
  editable,
}: {
  postId: string;
  target: Target;
  /** The post can still be changed by this user (fixing content means editing it). */
  editable: boolean;
}) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const queryClient = useQueryClient();
  const { account } = target;
  const network = networkName(account.network);
  const gone = account.status === 'disconnected';

  const retry = useMutation({
    mutationFn: () =>
      api(apiRoutes.posts.retryTarget, {
        params: { workspaceId: workspace.id, postId, targetId: target.id },
      }),
    onSuccess: (post) => {
      rememberPost(queryClient, workspace.id, post);
      toast.success(t('target.retrying', { account: account.displayName }));
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : '';
      const known = [
        'POST_HAS_ERRORS',
        'TARGET_NOT_FAILED',
        'ACCOUNT_NOT_AVAILABLE',
        'REVIEW_REQUIRED',
      ];
      toast.error(
        known.includes(code)
          ? t(`target.retryErrors.${code as 'POST_HAS_ERRORS'}`)
          : errorMessage(err),
      );
      // Whatever changed on the server (someone else retried, the account went), show it.
      void queryClient.invalidateQueries({
        queryKey: postKeys.detail(workspace.id, postId),
      });
    },
  });

  const failed = target.status === 'failed';
  const error = failed ? target.lastError : null;
  const needsReconnect = gone || account.status === 'reauth_required' || error?.kind === 'auth';

  return (
    <Card className="gap-3 p-4" data-target-status={target.status}>
      <div className="flex items-start gap-3">
        <AccountAvatar account={account} size="md" decorative />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-ink truncate text-sm font-semibold">{account.displayName}</span>
          <span className="text-ink-3 truncate text-xs">
            {network}
            {account.username && ` · @${account.username}`}
          </span>
        </div>
        <PostStatusChip status={target.status} className="shrink-0" />
      </div>

      <TargetState target={target} network={network} />

      {error && (
        <div className="bg-danger-tint rounded-control flex flex-col gap-1.5 px-3 py-2.5 text-[13px]">
          <p className="text-ink leading-relaxed">
            {gone ? t('target.accountGone') : t(`target.errors.${error.kind}`, { network })}
          </p>
          {error.message && (
            <p className="text-ink-2 text-xs leading-relaxed wrap-break-word">
              {t('target.networkSaid', { network, message: error.message })}
            </p>
          )}
        </div>
      )}

      {failed && (
        <div className="flex flex-wrap gap-2">
          {can('posts:publish') && !gone && (
            <Button
              size="sm"
              variant={needsReconnect ? 'secondary' : 'primary'}
              loading={retry.isPending}
              onClick={() => {
                retry.mutate();
              }}
            >
              <RotateCw aria-hidden="true" />
              {t('target.retryAction')}
            </Button>
          )}
          {needsReconnect && can('accounts:connect') && (
            <Button asChild size="sm" variant={gone ? 'primary' : 'secondary'}>
              <Link
                to="/w/$slug/accounts"
                params={{ slug: workspace.slug }}
                search={{ account: account.id }}
              >
                {t('target.reconnect')}
              </Link>
            </Button>
          )}
          {error?.kind === 'content' && editable && (
            <Button asChild size="sm" variant="secondary">
              <Link to="/w/$slug/compose/{-$postId}" params={{ slug: workspace.slug, postId }}>
                {t('target.editPost')}
              </Link>
            </Button>
          )}
        </div>
      )}

      {target.history.length > 0 && <History attempts={target.history} defaultOpen={failed} />}
    </Card>
  );
}

/** One line on where the delivery stands, when it isn't a failure (that has its own box). */
function TargetState({ target, network }: { target: Target; network: string }) {
  const { t } = useTranslation('posts');
  switch (target.status) {
    case 'published':
      return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          {target.publishedAt && (
            <span className="text-ink-2">
              {t('target.publishedAt', { time: formatDateTime(target.publishedAt) })}
            </span>
          )}
          {/* The address comes from the network; only web addresses become links. */}
          {target.permalink && /^https?:\/\//i.test(target.permalink) && (
            <a
              href={target.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink inline-flex items-center gap-1 font-medium underline decoration-current/30 underline-offset-2 hover:decoration-current"
            >
              {t('target.view', { network })}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      );
    case 'publishing':
      return <p className="text-ink-2 text-[13px]">{t('target.sending', { network })}</p>;
    case 'scheduled':
      return target.scheduledAt ? (
        <p className="text-ink-2 text-[13px]">
          {t('target.scheduledFor', { time: formatDateTime(target.scheduledAt) })}
        </p>
      ) : null;
    case 'pending':
      return <p className="text-ink-3 text-[13px]">{t('target.waiting')}</p>;
    case 'cancelled':
      return <p className="text-ink-3 text-[13px]">{t('target.cancelled')}</p>;
    case 'failed':
      return null;
  }
}

/**
 * Every try at sending to this account, oldest first, as a timeline: when it started, how it
 * ended and what the network said. Open by default when the delivery failed.
 */
function History({ attempts, defaultOpen }: { attempts: PublishAttempt[]; defaultOpen: boolean }) {
  const { t } = useTranslation('posts');
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const oldestFirst = [...attempts].sort((a, b) => a.attemptNo - b.attemptNo);
  return (
    <div className="border-hair flex flex-col border-t pt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="text-ink-2 hover:text-ink -mx-1 flex items-center gap-1 self-start rounded-md px-1 py-1 text-xs font-medium"
      >
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform motion-reduce:transition-none',
            open || '-rotate-90',
          )}
          aria-hidden="true"
        />
        {t('target.historyToggle', { count: attempts.length })}
      </button>
      {open && (
        <ol id={id} aria-label={t('target.history')} className="mt-2 flex flex-col">
          {oldestFirst.map((a, i) => (
            <li key={a.id} className="relative flex gap-3 pb-3 last:pb-0">
              {/* The line joining the dots runs down to the next attempt. */}
              {i < oldestFirst.length - 1 && (
                <span
                  className="bg-hair-strong absolute top-3 bottom-0 left-[3.5px] w-px"
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full',
                  a.outcome === 'published' && 'bg-success',
                  a.outcome === 'failed' && 'bg-danger',
                  a.outcome === 'will_retry' && 'bg-warning',
                  a.outcome === 'running' && 'bg-accent',
                )}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5 text-xs">
                <span className="text-ink font-medium">
                  {t('target.attempt', { n: a.attemptNo })}: {t(`target.outcome.${a.outcome}`)}
                </span>
                <time dateTime={a.startedAt} className="text-ink-3">
                  {formatDateTime(a.startedAt)}
                </time>
                {a.error?.message && (
                  <span className="text-ink-2 wrap-break-word">{a.error.message}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
