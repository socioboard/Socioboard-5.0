import {
  apiRoutes,
  type NetworkId,
  type Post,
  type ReviewItem,
  type ReviewStep,
} from '@socioboard/contracts';
import {
  Avatar,
  Button,
  DataTable,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  NavTabs,
  PageHeader,
  Skeleton,
  Textarea,
  toast,
  type Column,
} from '@socioboard/ui';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { CalendarClock, Check, ClipboardCheck, MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, networksQuery } from '../../accounts';
import { fromPost, PreviewPanel, ScheduleDialog } from '../../composer';
import { AccountStack, PostStatusChip, postKeys, postQuery } from '../../posts';
import {
  approvalKeys,
  mySubmissionsQuery,
  reviewHistoryQuery,
  reviewsQuery,
  type ReviewTab,
} from '../api';

export interface ApprovalsSearch {
  /** Decided instead of waiting; undefined for waiting. */
  tab?: 'decided' | undefined;
  /** The post open in the review panel. */
  post?: string | undefined;
}

/** The start of a post's text on one or two lines, or what it carries when it has none. */
function excerpt(post: Post, noText: string) {
  const text = post.text.trim();
  return text === '' ? noText : text;
}

/**
 * `/w/:slug/approvals` (P4-F2, docs/frontend/areas/approvals.md). People who approve see the
 * review queue (waiting, the longest-waiting first, or decided) and review a post in a panel:
 * its live previews, its review so far, and Approve, Approve & schedule or Request changes.
 * Everyone else sees what they sent for review and what came back.
 */
export function ApprovalsPage({
  search,
  onSearchChange,
}: {
  search: ApprovalsSearch;
  onSearchChange: (patch: Partial<ApprovalsSearch>) => void;
}) {
  const { t } = useTranslation('approvals');
  const can = useCan();
  const canApprove = can('posts:approve');
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={canApprove ? t('title') : t('mine.title')} />
      {canApprove ? (
        <ReviewQueue search={search} onSearchChange={onSearchChange} />
      ) : (
        <MySubmissions />
      )}
      {canApprove && (
        <ReviewPanel
          postId={search.post}
          onClose={() => {
            onSearchChange({ post: undefined });
          }}
        />
      )}
    </div>
  );
}

function ReviewQueue({
  search,
  onSearchChange,
}: {
  search: ApprovalsSearch;
  onSearchChange: (patch: Partial<ApprovalsSearch>) => void;
}) {
  const { t } = useTranslation('approvals');
  const { workspace } = useWorkspace();
  const tab: ReviewTab = search.tab === 'decided' ? 'decided' : 'pending';
  const reviews = useInfiniteQuery(reviewsQuery(workspace.id, tab));
  const rows = reviews.data?.pages.flatMap((p) => p.items) ?? [];

  const columns: Column<ReviewItem>[] = [
    {
      id: 'post',
      header: t('table.post'),
      cell: (item) => (
        <span className="text-ink line-clamp-2 py-2 text-sm">
          {excerpt(item.post, t('table.noText'))}
        </span>
      ),
    },
    {
      id: 'accounts',
      header: t('table.accounts'),
      cell: (item) => <AccountStack targets={item.post.targets} />,
      className: 'w-36 @max-2xl:hidden',
    },
    {
      id: 'who',
      header: tab === 'pending' ? t('table.submitted') : t('table.decided'),
      className: 'w-48 @max-xl:hidden',
      cell: (item) => {
        const who = tab === 'pending' ? item.submittedBy : item.latest.actor;
        return (
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Avatar name={who?.name ?? '?'} src={who?.avatarUrl ?? null} size="sm" decorative />
            <span className="flex min-w-0 flex-col">
              <span className="text-ink truncate">{who?.name ?? t('someone')}</span>
              <span className="text-ink-3 text-xs">
                {formatDate(tab === 'pending' ? item.submittedAt : item.latest.createdAt)}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('table.status'),
      className: 'w-36',
      cell: (item) =>
        tab === 'pending' ? (
          <PostStatusChip status={item.post.status} />
        ) : (
          <span
            className={
              item.latest.action === 'approved'
                ? 'text-success text-sm font-medium'
                : 'text-warning text-sm font-medium'
            }
          >
            {t(`steps.${item.latest.action}`)}
          </span>
        ),
    },
  ];

  return (
    <>
      <NavTabs aria-label={t('tabs.label')}>
        {(['pending', 'decided'] as const).map((id) => (
          <Link
            key={id}
            to="/w/$slug/approvals"
            params={{ slug: workspace.slug }}
            search={{ tab: id === 'decided' ? 'decided' : undefined }}
            activeOptions={{ includeSearch: true, explicitUndefined: true }}
          >
            {t(`tabs.${id}`)}
          </Link>
        ))}
      </NavTabs>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 sm:py-4">
          <DataTable
            caption={`${t('title')}: ${t(`tabs.${tab}`)}`}
            columns={columns}
            rows={rows}
            getRowId={(item) => `${item.post.id}:${item.latest.id}`}
            onRowClick={(item) => {
              onSearchChange({ post: item.post.id });
            }}
            loading={reviews.isPending}
            error={reviews.isError ? t('loadError') : undefined}
            onRetry={() => void reviews.refetch()}
            empty={
              <EmptyState
                icon={<ClipboardCheck />}
                title={t(`empty.${tab}.title`)}
                description={t(`empty.${tab}.body`)}
              />
            }
            hasMore={reviews.hasNextPage}
            onLoadMore={() => void reviews.fetchNextPage()}
            loadingMore={reviews.isFetchingNextPage}
            labels={{
              loadMore: t('table.loadMore'),
              retry: t('table.retry'),
              loading: t('table.loading'),
            }}
          />
        </div>
      </div>
    </>
  );
}

/** A contributor's side: what they sent for review, and what came back approved or scheduled. */
function MySubmissions() {
  const { t } = useTranslation('approvals');
  const { me, workspace } = useWorkspace();
  const navigate = useNavigate();
  const posts = useInfiniteQuery(mySubmissionsQuery(workspace.id, me.user.id));
  const rows = posts.data?.pages.flatMap((p) => p.items) ?? [];
  const columns: Column<Post>[] = [
    {
      id: 'post',
      header: t('table.post'),
      cell: (post) => (
        <span className="text-ink line-clamp-2 py-2 text-sm">
          {excerpt(post, t('table.noText'))}
        </span>
      ),
    },
    {
      id: 'accounts',
      header: t('table.accounts'),
      cell: (post) => <AccountStack targets={post.targets} />,
      className: 'w-36 @max-2xl:hidden',
    },
    {
      id: 'status',
      header: t('table.status'),
      className: 'w-36',
      cell: (post) => <PostStatusChip status={post.status} />,
    },
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 sm:py-4">
        <p className="text-ink-2 mb-3 max-w-prose px-2 text-sm">{t('mine.intro')}</p>
        <DataTable
          caption={t('mine.title')}
          columns={columns}
          rows={rows}
          getRowId={(post) => post.id}
          onRowClick={(post) =>
            void navigate({
              to: '/w/$slug/compose/{-$postId}',
              params: { slug: workspace.slug, postId: post.id },
            })
          }
          loading={posts.isPending}
          error={posts.isError ? t('loadError') : undefined}
          onRetry={() => void posts.refetch()}
          empty={
            <EmptyState
              icon={<ClipboardCheck />}
              title={t('mine.empty.title')}
              description={t('mine.empty.body')}
            />
          }
          hasMore={posts.hasNextPage}
          onLoadMore={() => void posts.fetchNextPage()}
          loadingMore={posts.isFetchingNextPage}
          labels={{
            loadMore: t('table.loadMore'),
            retry: t('table.retry'),
            loading: t('table.loading'),
          }}
        />
      </div>
    </div>
  );
}

/** The review panel: a right-hand panel on wide screens, a bottom sheet on phones. */
function ReviewPanel({ postId, onClose }: { postId: string | undefined; onClose: () => void }) {
  const { t } = useTranslation('approvals');
  return (
    <Drawer
      open={postId !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="sm:max-w-2xl" closeLabel={t('panel.close')}>
        {postId && <ReviewBody postId={postId} onDone={onClose} />}
      </DrawerContent>
    </Drawer>
  );
}

function ReviewBody({ postId, onDone }: { postId: string; onDone: () => void }) {
  const { t } = useTranslation('approvals');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const post = useQuery(postQuery(workspace.id, postId));
  const history = useQuery(reviewHistoryQuery(workspace.id, postId));
  const accounts = useQuery(accountsQuery(workspace.id));
  const networks = useQuery(networksQuery);
  const [previewTab, setPreviewTab] = useState<NetworkId | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<'approve' | 'schedule' | 'changes' | null>(null);

  if (post.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="rounded-pane h-64 w-full" />
      </div>
    );
  }
  if (post.isError) {
    return <EmptyState title={errorMessage(post.error)} />;
  }
  const p = post.data;
  const waiting = p.status === 'in_review';
  const selected = [
    ...new Set(p.targets.filter((x) => x.status !== 'cancelled').map((x) => x.account.network)),
  ];
  const submitted = [...(history.data ?? [])].reverse().find((s) => s.action === 'submitted');

  const done = async (message: string) => {
    toast.success(message);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: approvalKeys.all(workspace.id) }),
      queryClient.invalidateQueries({ queryKey: postKeys.all(workspace.id) }),
    ]);
    onDone();
  };
  const refused = (err: unknown) => {
    const words: Record<string, string> = {
      CANNOT_APPROVE_OWN: t('errors.ownPost'),
      POST_NOT_IN_REVIEW: t('errors.notInReview'),
      REVIEW_REQUIRED: t('errors.reviewRequired'),
    };
    toast.error((err instanceof ApiError ? words[err.code] : undefined) ?? errorMessage(err));
  };
  const params = { workspaceId: workspace.id, postId: p.id };

  const approve = async (at?: Date) => {
    setBusy(at ? 'schedule' : 'approve');
    try {
      await api(apiRoutes.approvals.approvePost, {
        params,
        body: at ? { schedule: { at: at.toISOString() } } : {},
      });
      setScheduling(false);
      await done(at ? t('done.approvedScheduled') : t('done.approved'));
    } catch (err) {
      refused(err);
    } finally {
      setBusy(null);
    }
  };
  const requestChanges = async () => {
    setBusy('changes');
    try {
      await api(apiRoutes.approvals.requestChanges, { params, body: { note: note.trim() } });
      await done(t('done.changes'));
    } catch (err) {
      refused(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{waiting ? t('panel.title') : t('panel.titleDone')}</DrawerTitle>
        <DrawerDescription>
          {submitted
            ? t('panel.submitted', {
                name: submitted.actor?.name ?? t('someone'),
                date: formatDate(submitted.createdAt),
              })
            : null}
        </DrawerDescription>
      </DrawerHeader>
      {submitted?.note && (
        <blockquote className="border-hair text-ink-2 border-l-2 pl-3 text-sm">
          {submitted.note}
        </blockquote>
      )}
      {accounts.data && networks.data ? (
        <PreviewPanel
          workspaceId={workspace.id}
          draft={fromPost(p)}
          selected={selected}
          accounts={accounts.data}
          networks={networks.data}
          active={previewTab}
          onActiveChange={setPreviewTab}
        />
      ) : (
        <Skeleton className="rounded-pane h-64 w-full" />
      )}
      <ReviewHistory steps={history.data ?? []} />
      {waiting ? (
        asking ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="changes-note" className="text-ink text-sm font-medium">
              {t('changes.label')}
            </label>
            <Textarea
              id="changes-note"
              value={note}
              maxLength={2000}
              rows={3}
              autoFocus
              placeholder={t('changes.placeholder')}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setAsking(false);
                }}
              >
                {t('changes.cancel')}
              </Button>
              <Button
                variant="primary"
                disabled={note.trim() === '' || busy !== null}
                loading={busy === 'changes'}
                onClick={() => void requestChanges()}
              >
                {t('changes.send')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              disabled={busy !== null}
              onClick={() => {
                setAsking(true);
              }}
            >
              <MessageSquareWarning aria-hidden="true" />
              {t('actions.changes')}
            </Button>
            <Button
              disabled={busy !== null}
              loading={busy === 'schedule'}
              onClick={() => {
                setScheduling(true);
              }}
            >
              <CalendarClock aria-hidden="true" />
              {t('actions.approveSchedule')}
            </Button>
            <Button
              variant="primary"
              disabled={busy !== null}
              loading={busy === 'approve'}
              onClick={() => void approve()}
            >
              <Check aria-hidden="true" />
              {t('actions.approve')}
            </Button>
          </div>
        )
      ) : (
        <p className="text-ink-3 text-sm">{t('panel.notWaiting')}</p>
      )}
      <Link
        to="/w/$slug/compose/{-$postId}"
        params={{ slug: workspace.slug, postId: p.id }}
        className="text-ink-2 text-sm underline underline-offset-2"
      >
        {t('panel.openComposer')}
      </Link>
      <ScheduleDialog
        open={scheduling}
        onOpenChange={setScheduling}
        post={p}
        recurrence={null}
        canRepeat={false}
        busy={busy === 'schedule'}
        onSchedule={(at) => void approve(at)}
        onRepeat={() => undefined}
      />
    </>
  );
}

/** The review so far, oldest first: who sent it, approved it or asked for changes, and why. */
function ReviewHistory({ steps }: { steps: ReviewStep[] }) {
  const { t } = useTranslation('approvals');
  if (steps.length === 0) return null;
  return (
    <section aria-label={t('history.title')} className="flex flex-col gap-2">
      <h3 className="text-ink text-sm font-semibold">{t('history.title')}</h3>
      <ol className="flex flex-col gap-2">
        {steps.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-sm">
            <Avatar
              name={s.actor?.name ?? '?'}
              src={s.actor?.avatarUrl ?? null}
              size="sm"
              decorative
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-ink">
                {t(`history.${s.action}`, { name: s.actor?.name ?? t('someone') })}{' '}
                <span className="text-ink-3 text-xs">{formatDate(s.createdAt)}</span>
              </span>
              {s.note && <span className="text-ink-2">“{s.note}”</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
