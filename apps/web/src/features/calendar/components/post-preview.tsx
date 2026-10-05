import { apiRoutes, type CalendarEntry } from '@socioboard/contracts';
import {
  Avatar,
  Banner,
  Button,
  ConfirmDialog,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  MediaThumb,
  NetworkIcon,
  Skeleton,
  StatusChip,
  toast,
} from '@socioboard/ui';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Copy, ExternalLink, Pencil, Repeat, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { mediaDetailQuery } from '../../media';
import { postKeys, postQuery, rememberPost } from '../../posts';
import { calendarKeys } from '../api';

/** The server's full post, with separate content and reschedule controls for every delivery. */
export function PostPreview({
  postId,
  close,
  reschedule,
  busy,
}: {
  postId: string;
  close: () => void;
  reschedule: (entry: CalendarEntry) => void;
  busy: ReadonlyMap<string, string>;
}) {
  const { t } = useTranslation('calendar');
  const { t: statusT } = useTranslation('posts');
  const { workspace, me } = useWorkspace();
  const time = useWorkspaceTime();
  const can = useCan();
  const client = useQueryClient();
  const navigate = useNavigate();
  const post = useQuery(postQuery(workspace.id, postId));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const data = post.data;
  const mayEdit =
    data &&
    !data.targets.some((x) => x.status === 'published' || x.status === 'publishing') &&
    (data.author?.id === me.user.id ? can('posts:create') : can('posts:approve'));
  const duplicate = useMutation({
    mutationFn: () =>
      api(apiRoutes.posts.duplicatePost, { params: { workspaceId: workspace.id, postId } }),
    onSuccess: (copy) => {
      rememberPost(client, workspace.id, copy);
      toast.success(t('duplicated'));
      close();
      void navigate({
        to: '/w/$slug/compose/{-$postId}',
        params: { slug: workspace.slug, postId: copy.id },
      });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = async () => {
    await api(apiRoutes.posts.deletePost, { params: { workspaceId: workspace.id, postId } });
    client.removeQueries({ queryKey: postKeys.detail(workspace.id, postId) });
    void client.invalidateQueries({ queryKey: postKeys.lists(workspace.id) });
    void client.invalidateQueries({ queryKey: calendarKeys.all(workspace.id) });
    toast.success(t('deleted'));
    close();
  };
  return (
    <>
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DrawerContent closeLabel={t('close')} className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>{t('preview')}</DrawerTitle>
            <DrawerDescription>{time.zone}</DrawerDescription>
          </DrawerHeader>
          {post.isPending ? (
            <Skeleton className="h-64" />
          ) : !data ? (
            <EmptyState
              title={
                post.error instanceof ApiError && post.error.status === 404
                  ? t('notFound')
                  : t('loadError')
              }
              action={<Button onClick={() => void post.refetch()}>{t('retry')}</Button>}
            />
          ) : (
            <div className="stagger-children flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
              {post.isError && <Banner tone="warning">{t('stale')}</Banner>}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/w/$slug/posts/$postId" params={{ slug: workspace.slug, postId }}>
                    {t('details')}
                  </Link>
                </Button>
                {mayEdit && (
                  <Button asChild size="sm">
                    <Link
                      to="/w/$slug/compose/{-$postId}"
                      params={{ slug: workspace.slug, postId }}
                    >
                      <Pencil aria-hidden="true" />
                      {t('edit')}
                    </Link>
                  </Button>
                )}
                {can('posts:create') && (
                  <Button
                    size="sm"
                    loading={duplicate.isPending}
                    onClick={() => {
                      duplicate.mutate();
                    }}
                  >
                    <Copy aria-hidden="true" />
                    {t('duplicate')}
                  </Button>
                )}
                {mayEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy.size > 0}
                    onClick={() => {
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    {t('delete')}
                  </Button>
                )}
              </div>
              {data.recurring === 'occurrence' && (
                <p className="text-ink-3 flex items-center gap-2 text-xs">
                  <Repeat className="size-3.5" aria-hidden="true" />
                  {t('recurring')}
                </p>
              )}
              {data.targets.map((target) => {
                const scheduled = target.scheduledAt;
                const at =
                  busy.get(target.id) ??
                  target.publishedAt ??
                  target.scheduledAt ??
                  target.history.at(-1)?.startedAt;
                const text = target.override?.text ?? data.text;
                return (
                  <section
                    key={target.id}
                    className="glass-chip rounded-pane flex flex-col gap-3 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={target.account.displayName}
                        src={target.account.avatarUrl}
                        size="sm"
                        decorative
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-ink truncate text-sm font-semibold">
                          {target.account.displayName}
                        </p>
                        {at && (
                          <p
                            className="text-ink-3 text-xs"
                            title={time.differs ? time.own(at, 'long') : undefined}
                          >
                            {time.format(at, 'long')}
                          </p>
                        )}
                      </div>
                      <NetworkIcon network={target.account.network} size="sm" decorative />
                    </div>
                    <StatusChip status={target.status} label={statusT(`status.${target.status}`)} />
                    <p className="text-ink whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                      {text || t('noText')}
                    </p>
                    <PreviewMedia ids={target.override?.mediaIds ?? data.mediaIds} />
                    {data.link && (
                      <a
                        href={data.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-2 wrap-break-word text-sm underline underline-offset-2"
                      >
                        {data.link}
                      </a>
                    )}
                    {target.lastError && <Banner tone="danger">{target.lastError.message}</Banner>}
                    <div className="flex flex-wrap gap-2">
                      {target.status === 'scheduled' && scheduled && can('posts:publish') && (
                        <Button
                          size="sm"
                          disabled={busy.has(target.id)}
                          aria-label={t('rescheduleAccount', {
                            account: target.account.displayName,
                          })}
                          onClick={() => {
                            reschedule({
                              targetId: target.id,
                              postId,
                              account: target.account,
                              status: target.status,
                              at: scheduled,
                              text: text.slice(0, 280),
                              thumbnailUrl: null,
                              mediaCount: (target.override?.mediaIds ?? data.mediaIds).length,
                              labelIds: data.labelIds,
                              recurring: data.recurring === 'occurrence',
                              permalink: target.permalink,
                              lastError: target.lastError,
                            });
                          }}
                        >
                          {t('reschedule')}
                        </Button>
                      )}
                      {target.permalink && (
                        <Button asChild size="sm">
                          <a href={target.permalink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink aria-hidden="true" />
                            {t('permalink')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </DrawerContent>
      </Drawer>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('deleteTitle')}
        description={t('deleteBody')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone="danger"
        onConfirm={remove}
        errorMessage={errorMessage}
      />
    </>
  );
}

function PreviewMedia({ ids }: { ids: string[] }) {
  const { workspace } = useWorkspace();
  const media = useQueries({
    queries: ids.map((id) => ({ ...mediaDetailQuery(workspace.id, id), retry: false })),
  });
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {media.map((item, i) =>
        item.data ? (
          <MediaThumb
            key={ids[i]}
            src={item.data.thumbnailUrl}
            alt={item.data.altText ?? item.data.name}
            kind={item.data.kind}
            durationSec={item.data.durationSec}
          />
        ) : (
          <Skeleton key={ids[i]} className="size-20" />
        ),
      )}
    </div>
  );
}
