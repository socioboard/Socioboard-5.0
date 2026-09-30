import { apiRoutes, type NetworkId, type PostDetails } from '@socioboard/contracts';
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  MediaThumb,
  NetworkIcon,
  networkName,
  PageHeader,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Copy, Ellipsis, Link2, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { isPending, mediaDetailQuery } from '../../media';
import { postKeys, postQuery, rememberPost } from '../api';
import { PostStatusChip } from './post-bits';
import { LabelPicker } from './label-picker';
import { TargetCard } from './target-card';

/** Targets in these states make a post history: it can't be edited or deleted any more. */
const LOCKED = new Set(['publishing', 'published']);

/**
 * `/w/:slug/posts/:postId` (docs/frontend/areas/posts.md): the post, where it went and how each
 * delivery went, with the way to fix one that failed.
 */
export function PostDetailPage({ postId }: { postId: string }) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const post = useQuery(postQuery(workspace.id, postId));

  let body: ReactNode;
  if (post.isPending) {
    body = (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]" aria-hidden="true">
        <div className="flex flex-col gap-3">
          <Skeleton className="rounded-control h-32" />
          <Skeleton className="rounded-control h-32" />
        </div>
        <Skeleton className="rounded-control h-64" />
      </div>
    );
  } else if (post.isError) {
    const gone = post.error instanceof ApiError && post.error.status === 404;
    body = (
      <EmptyState
        title={gone ? t('detail.notFound') : t('detail.loadError')}
        action={
          gone ? (
            <Button asChild>
              <Link to="/w/$slug/posts" params={{ slug: workspace.slug }}>
                {t('detail.back')}
              </Link>
            </Button>
          ) : (
            <Button onClick={() => void post.refetch()}>{t('detail.retry')}</Button>
          )
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('detail.title')}
        leading={
          <Button asChild variant="ghost" size="icon" aria-label={t('detail.back')}>
            <Link to="/w/$slug/posts" params={{ slug: workspace.slug }}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
        }
        actions={post.data && <Actions post={post.data} />}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
          {body ?? (post.data && <Details post={post.data} />)}
        </div>
      </div>
    </div>
  );
}

/** Whether this user may change the post: its author, or someone who approves posts. */
function useMayEdit(post: PostDetails) {
  const { me } = useWorkspace();
  const can = useCan();
  const mine = post.author?.id === me.user.id;
  const locked = post.targets.some((x) => LOCKED.has(x.status));
  return !locked && (mine ? can('posts:create') : can('posts:approve'));
}

/**
 * Whether this user may change the post's labels: like editing, but also after it went out
 * (labels organise the posts list, so the API allows them on sent posts).
 */
function useMayLabel(post: PostDetails) {
  const { me } = useWorkspace();
  const can = useCan();
  return post.author?.id === me.user.id ? can('posts:create') : can('posts:approve');
}

/** The post's labels, saved as soon as they change. */
function PostLabels({ post }: { post: PostDetails }) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const mayLabel = useMayLabel(post);
  const save = useMutation({
    mutationFn: (labelIds: string[]) =>
      api(apiRoutes.posts.updatePost, {
        params: { workspaceId: workspace.id, postId: post.id },
        body: { labelIds },
      }),
    onSuccess: (saved) => {
      rememberPost(queryClient, workspace.id, saved);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  // The latest change shows at once (the mutation's own state arrives a tick later) and stays
  // until its save settles; a failed one falls back to what the server has.
  const [pending, setPending] = useState<string[] | null>(null);
  const value = pending ?? post.labelIds;
  return (
    <div role="group" aria-labelledby="post-labels" className="flex flex-wrap items-center gap-2">
      <span id="post-labels" className="sr-only">
        {t('labels.title')}
      </span>
      <LabelPicker
        value={value}
        disabled={!mayLabel}
        onChange={(labelIds) => {
          setPending(labelIds);
          save.mutate(labelIds, {
            // Only the latest change clears it; an earlier save finishing leaves the newer one.
            onSettled: () => {
              setPending((current) => (current === labelIds ? null : current));
            },
          });
        }}
      />
    </div>
  );
}

function Actions({ post }: { post: PostDetails }) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const mayEdit = useMayEdit(post);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const duplicate = useMutation({
    mutationFn: () =>
      api(apiRoutes.posts.duplicatePost, {
        params: { workspaceId: workspace.id, postId: post.id },
      }),
    onSuccess: (copy) => {
      rememberPost(queryClient, workspace.id, copy);
      toast.success(t('detail.duplicated'));
      void navigate({
        to: '/w/$slug/compose/{-$postId}',
        params: { slug: workspace.slug, postId: copy.id },
      });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = async () => {
    await api(apiRoutes.posts.deletePost, {
      params: { workspaceId: workspace.id, postId: post.id },
    });
    toast.success(t('detail.deleted'));
    void queryClient.invalidateQueries({ queryKey: postKeys.lists(workspace.id) });
    await navigate({ to: '/w/$slug/posts', params: { slug: workspace.slug }, replace: true });
    queryClient.removeQueries({ queryKey: postKeys.detail(workspace.id, post.id) });
  };

  const canDuplicate = can('posts:create');
  if (!mayEdit && !canDuplicate) return null;
  return (
    <>
      {mayEdit && (
        <Button asChild size="sm">
          <Link to="/w/$slug/compose/{-$postId}" params={{ slug: workspace.slug, postId: post.id }}>
            <Pencil aria-hidden="true" />
            {t('detail.edit')}
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('detail.more')}>
            <Ellipsis aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canDuplicate && (
            <DropdownMenuItem
              disabled={duplicate.isPending}
              onSelect={() => {
                duplicate.mutate();
              }}
            >
              <Copy aria-hidden="true" />
              {t('detail.duplicate')}
            </DropdownMenuItem>
          )}
          {mayEdit && (
            <DropdownMenuItem
              tone="danger"
              onSelect={() => {
                setConfirmDelete(true);
              }}
            >
              <Trash2 aria-hidden="true" />
              {t('detail.delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('detail.deleteTitle')}
        description={t('detail.deleteBody')}
        confirmLabel={t('detail.deleteConfirm')}
        cancelLabel={t('detail.deleteCancel')}
        tone="danger"
        onConfirm={remove}
        errorMessage={errorMessage}
      />
    </>
  );
}

function Details({ post }: { post: PostDetails }) {
  const { t } = useTranslation('posts');
  const mayEdit = useMayEdit(post);
  const live = post.targets.filter((x) => x.status !== 'cancelled');
  const cancelled = post.targets.filter((x) => x.status === 'cancelled');
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <PostStatusChip status={post.status} />
        <span className="text-ink-2 flex items-center gap-2 text-[13px]">
          {post.author && (
            <Avatar name={post.author.name} src={post.author.avatarUrl} size="xs" decorative />
          )}
          {post.author ? t('detail.by', { name: post.author.name }) : t('detail.unknownAuthor')}
        </span>
        <time dateTime={post.createdAt} className="text-ink-3 text-[13px]">
          {t('detail.created', { time: formatDateTime(post.createdAt) })}
        </time>
        <PostLabels post={post} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
        <section aria-labelledby="post-deliveries" className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="post-deliveries" className="text-ink text-[15px] font-semibold tracking-tight">
              {t('detail.deliveries')}
            </h2>
            {live.length > 0 && (
              <p className="text-ink-3 text-xs">
                {t('detail.deliveriesHint', { count: live.length })}
              </p>
            )}
          </div>
          {live.length === 0 && <p className="text-ink-2 text-sm">{t('detail.noTargets')}</p>}
          {[...live, ...cancelled].map((target) => (
            <TargetCard key={target.id} postId={post.id} target={target} editable={mayEdit} />
          ))}
        </section>
        <ContentPanel post={post} />
      </div>
    </>
  );
}

/** What the post says: the shared content, then each network's own version where it has one. */
function ContentPanel({ post }: { post: PostDetails }) {
  const { t } = useTranslation('posts');
  // Overrides are per account; the composer writes one per network, so show each network once.
  const own = new Map<NetworkId, { text?: string | undefined; mediaIds?: string[] | undefined }>();
  for (const target of post.targets) {
    const o = target.override;
    if (!o || own.has(target.account.network)) continue;
    if (o.text !== undefined || o.mediaIds !== undefined) {
      own.set(target.account.network, { text: o.text, mediaIds: o.mediaIds });
    }
  }
  const empty = !post.text.trim() && post.mediaIds.length === 0 && !post.link && !post.firstComment;
  return (
    <section aria-labelledby="post-content" className="flex min-w-0 flex-col gap-3">
      <h2 id="post-content" className="text-ink text-[15px] font-semibold tracking-tight">
        {t('detail.content')}
      </h2>
      <Card className="gap-4 p-4">
        {own.size > 0 && (
          <h3 className="text-ink-3 text-xs font-semibold">{t('detail.sharedContent')}</h3>
        )}
        {empty ? (
          <p className="text-ink-3 text-sm">{t('detail.noContent')}</p>
        ) : (
          <ContentBody text={post.text} mediaIds={post.mediaIds} />
        )}
        {post.link && (
          <Field icon={<Link2 />} label={t('detail.link')}>
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink break-all underline decoration-current/30 underline-offset-2 hover:decoration-current"
            >
              {post.link}
            </a>
          </Field>
        )}
        {post.firstComment && (
          <Field icon={<MessageSquare />} label={t('detail.firstComment')}>
            <p className="text-ink whitespace-pre-wrap wrap-break-word">{post.firstComment}</p>
          </Field>
        )}
      </Card>
      {[...own].map(([network, content]) => (
        <Card key={network} className="gap-3 p-4">
          <h3 className="text-ink flex items-center gap-2 text-[13px] font-semibold">
            <NetworkIcon network={network} size="sm" decorative />
            {t('detail.contentFor', { network: networkName(network) })}
          </h3>
          <ContentBody
            text={content.text ?? post.text}
            mediaIds={content.mediaIds ?? post.mediaIds}
          />
        </Card>
      ))}
    </section>
  );
}

function ContentBody({ text, mediaIds }: { text: string; mediaIds: string[] }) {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('posts');
  const media = useQueries({
    queries: mediaIds.map((id) => ({ ...mediaDetailQuery(workspace.id, id), retry: false })),
  });
  return (
    <>
      {text.trim() && (
        <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {text}
        </p>
      )}
      {mediaIds.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {mediaIds.map((id, i) => {
            const asset = media[i]?.data;
            const gone = media[i]?.isError ?? false;
            return (
              <li key={id}>
                <MediaThumb
                  src={asset?.thumbnailUrl ?? null}
                  alt={gone ? t('detail.fileDeleted') : (asset?.altText ?? asset?.name ?? '')}
                  kind={asset?.kind ?? 'image'}
                  durationSec={asset?.durationSec ?? null}
                  status={
                    gone || asset?.status === 'failed'
                      ? 'failed'
                      : asset && isPending(asset)
                        ? 'processing'
                        : 'ready'
                  }
                  size="md"
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="border-hair flex flex-col gap-1 border-t pt-3 text-sm">
      <span className="text-ink-3 flex items-center gap-1.5 text-xs font-semibold [&>svg]:size-3.5">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}
