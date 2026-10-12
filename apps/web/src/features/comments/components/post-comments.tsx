import { apiRoutes } from '@socioboard/contracts';
import { CommentThread, Skeleton, toast } from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { relativeTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { commentKeys, commentsQuery, mentionableQuery } from '../api';

/**
 * A post's comments (P4-F3, docs/frontend/areas/approvals.md#comments), on the review panel and
 * the post's page: anyone who can see the post comments, replies one level deep, @mentions
 * members who can see it. Others' new comments arrive live (`post.comments_changed`).
 */
export function PostComments({
  postId,
  highlightId,
}: {
  postId: string;
  /** A comment to scroll to and mark (a notification's `?comment=`). */
  highlightId?: string | undefined;
}) {
  const { t, i18n } = useTranslation('approvals');
  const { workspace, me } = useWorkspace();
  const queryClient = useQueryClient();
  const headingId = useId();
  const thread = useQuery(commentsQuery(workspace.id, postId));
  const people = useQuery(mentionableQuery(workspace.id, postId));
  const loaded = thread.data !== undefined;

  // Bring the comment a notification pointed at into view, once it's there.
  useEffect(() => {
    if (!loaded || !highlightId) return;
    document
      .getElementById(`comment-${highlightId}`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [loaded, highlightId]);

  const params = { workspaceId: workspace.id, postId };
  /** Saves, then rereads the thread; a failure is shown and kept for the box (what was typed stays). */
  const save = async (call: () => Promise<unknown>) => {
    try {
      await call();
    } catch (err) {
      toast.error(errorMessage(err));
      throw err;
    }
    await queryClient.invalidateQueries({ queryKey: commentKeys.thread(workspace.id, postId) });
  };

  const count = thread.data?.filter((c) => c.deletedAt === null).length ?? 0;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3 id={headingId} className="text-ink text-sm font-semibold">
        {t('comments.title')}
        {count > 0 && <span className="text-ink-3 ml-1.5 font-normal tabular-nums">{count}</span>}
      </h3>
      {thread.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : thread.isError ? (
        <p className="text-ink-2 text-sm">{t('comments.loadError')}</p>
      ) : (
        <CommentThread
          comments={thread.data}
          currentUserId={me.user.id}
          people={people.data ?? []}
          highlightId={highlightId}
          formatTime={(iso) => relativeTime(iso, Date.now(), i18n.language)}
          onCreate={(body) => save(() => api(apiRoutes.approvals.createComment, { params, body }))}
          onUpdate={(commentId, body) =>
            save(() =>
              api(apiRoutes.approvals.updateComment, {
                params: { workspaceId: workspace.id, commentId },
                body,
              }),
            )
          }
          onDelete={(commentId) =>
            save(() =>
              api(apiRoutes.approvals.deleteComment, {
                params: { workspaceId: workspace.id, commentId },
              }),
            )
          }
          labels={{
            empty: t('comments.empty'),
            placeholder: t('comments.placeholder'),
            replyPlaceholder: t('comments.replyPlaceholder'),
            send: t('comments.send'),
            reply: t('comments.reply'),
            edit: t('comments.edit'),
            delete: t('comments.delete'),
            save: t('comments.save'),
            cancel: t('comments.cancel'),
            edited: t('comments.edited'),
            deleted: t('comments.deleted'),
            unknownAuthor: t('comments.unknownAuthor'),
            actions: t('comments.actions'),
            confirmDelete: t('comments.confirmDelete'),
            people: t('comments.people'),
            sendHint: t('comments.sendHint'),
          }}
        />
      )}
    </section>
  );
}
