import {
  realtimeRooms,
  type CreateCommentBody,
  type Mentionable,
  type PostComment,
  type UpdateCommentBody,
} from '@socioboard/contracts';

import {
  createUrlSigner,
  forbidden,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type MemberContext,
  type Realtime,
  type Storage,
} from '../../platform';
import type { PostEvents, PostService } from '../posts';
import { membersWhoSeePost } from '../workspaces';

export interface CommentServiceDeps {
  db: Db;
  clock: Clock;
  storage: Storage | undefined;
  realtime: Realtime;
  /** The app-wide bus; a comment is a post event (`post.commented`). */
  events: EventBus<Record<string, unknown>>;
  posts: Pick<PostService, 'assertVisible'>;
}

const withAuthor = {
  author: { select: { id: true, name: true, image: true, avatarKey: true } },
} as const;

/**
 * Comments on a post (P4-B3, docs/backend/modules/approvals.md): anyone who can see the post
 * can comment, viewers too; replies are one level deep; each comment may @mention members who
 * can see the post, who are notified (the notifications module's listener). Only its author
 * edits or deletes a comment. A deleted comment with replies stays, empty, as "Comment deleted";
 * one without replies goes.
 */
export function createCommentService(deps: CommentServiceDeps) {
  const { db, clock, posts, realtime } = deps;
  const events = typedEvents<PostEvents>(deps.events);
  const signUrl = createUrlSigner(deps.storage);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  /** Open threads on the post refetch. */
  const changed = (workspaceId: string, postId: string) => {
    realtime.emit(realtimeRooms.workspace(workspaceId), 'post.comments_changed', {
      workspaceId,
      postId,
    });
  };

  /** Members who can see the post, by name (P4-B4: a member limited to other accounts can't). */
  async function mentionable(member: MemberContext, postId: string): Promise<Mentionable[]> {
    await posts.assertVisible(member, postId);
    const audience = await membersWhoSeePost(db, member.workspaceId, postId);
    const users = await db.client.user.findMany({
      where: { id: { in: audience.map((m) => m.userId) } },
      select: { id: true, name: true, image: true, avatarKey: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return Promise.all(
      users.map(async (u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: await signUrl(u.avatarKey ?? u.image),
      })),
    );
  }

  /** Refuses (422 MENTION_NOT_ALLOWED) a mention of anyone who can't see the post. */
  async function assertMentionable(member: MemberContext, postId: string, ids: string[]) {
    if (ids.length === 0) return;
    const audience = new Set(
      (await membersWhoSeePost(db, member.workspaceId, postId)).map((m) => m.userId),
    );
    const outside = ids.filter((id) => !audience.has(id));
    if (outside.length > 0) {
      throw unprocessable(
        'MENTION_NOT_ALLOWED',
        'Only members who can see this post can be mentioned',
        { userIds: outside },
      );
    }
  }

  interface Row {
    id: string;
    postId: string;
    parentId: string | null;
    body: string;
    mentionedUserIds: string[];
    createdAt: Date;
    editedAt: Date | null;
    deletedAt: Date | null;
    author: { id: string; name: string; image: string | null; avatarKey: string | null } | null;
  }
  const rowSelect = {
    id: true,
    postId: true,
    parentId: true,
    body: true,
    mentionedUserIds: true,
    createdAt: true,
    editedAt: true,
    deletedAt: true,
    ...withAuthor,
  } as const;

  async function toComments(rows: Row[]): Promise<PostComment[]> {
    const ids = [...new Set(rows.flatMap((r) => (r.deletedAt ? [] : r.mentionedUserIds)))];
    const names = new Map(
      (
        await db.client.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        })
      ).map((u) => [u.id, u.name]),
    );
    return Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        postId: r.postId,
        parentId: r.parentId,
        author: r.deletedAt
          ? null
          : r.author && {
              id: r.author.id,
              name: r.author.name,
              avatarUrl: await signUrl(r.author.avatarKey ?? r.author.image),
            },
        body: r.deletedAt ? '' : r.body,
        // Someone whose account is gone drops out of the list; the text keeps their @name.
        mentions: r.deletedAt
          ? []
          : r.mentionedUserIds.flatMap((id) => {
              const name = names.get(id);
              return name ? [{ id, name }] : [];
            }),
        createdAt: r.createdAt.toISOString(),
        editedAt: r.editedAt?.toISOString() ?? null,
        deletedAt: r.deletedAt?.toISOString() ?? null,
      })),
    );
  }

  async function toComment(row: Row): Promise<PostComment> {
    const [comment] = await toComments([row]);
    if (!comment) throw new Error('A comment row always makes a comment');
    return comment;
  }

  /** Oldest first, each top-level comment followed by its replies. */
  async function list(member: MemberContext, postId: string): Promise<PostComment[]> {
    await posts.assertVisible(member, postId);
    const rows = await scoped(member.workspaceId).postComment.findMany({
      where: { postId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: rowSelect,
    });
    const replies = new Map<string, Row[]>();
    for (const r of rows) {
      if (r.parentId) replies.set(r.parentId, [...(replies.get(r.parentId) ?? []), r]);
    }
    const ordered = rows
      .filter((r) => r.parentId === null)
      .flatMap((r) => [r, ...(replies.get(r.id) ?? [])]);
    return toComments(ordered);
  }

  async function create(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    body: CreateCommentBody,
  ): Promise<PostComment> {
    await posts.assertVisible(member, postId);
    let parentId: string | null = null;
    if (body.parentId) {
      const parent = await scoped(member.workspaceId).postComment.findFirst({
        where: { id: body.parentId, postId },
        select: { id: true, parentId: true },
      });
      if (!parent) throw notFound('COMMENT_NOT_FOUND', 'Comment not found');
      // One level deep: a reply to a reply joins its thread.
      parentId = parent.parentId ?? parent.id;
    }
    await assertMentionable(member, postId, body.mentionIds);
    const row = await scoped(member.workspaceId).postComment.create({
      data: {
        id: newId(),
        workspaceId: member.workspaceId,
        postId,
        parentId,
        authorId: caller.user.id,
        body: body.body,
        mentionedUserIds: body.mentionIds,
      },
      select: rowSelect,
    });
    changed(member.workspaceId, postId);
    await events.emit('post.commented', {
      workspaceId: member.workspaceId,
      postId,
      commentId: row.id,
      userId: caller.user.id,
      mentionIds: body.mentionIds,
      edited: false,
    });
    return toComment(row);
  }

  /** The caller's own live comment on a post they can see (404 for anything else). */
  async function own(caller: AuthContext, member: MemberContext, commentId: string) {
    const found = await scoped(member.workspaceId).postComment.findFirst({
      where: { id: commentId, deletedAt: null },
      select: { id: true, postId: true, parentId: true, authorId: true, mentionedUserIds: true },
    });
    if (!found) throw notFound('COMMENT_NOT_FOUND', 'Comment not found');
    await posts.assertVisible(member, found.postId).catch(() => {
      throw notFound('COMMENT_NOT_FOUND', 'Comment not found');
    });
    if (found.authorId !== caller.user.id) {
      throw forbidden('NOT_COMMENT_AUTHOR', 'You can only change your own comments');
    }
    return found;
  }

  /** Edits the text; people newly mentioned are notified, those already mentioned aren't again. */
  async function update(
    caller: AuthContext,
    member: MemberContext,
    commentId: string,
    body: UpdateCommentBody,
  ): Promise<PostComment> {
    const found = await own(caller, member, commentId);
    await assertMentionable(member, found.postId, body.mentionIds);
    const row = await scoped(member.workspaceId).postComment.update({
      where: { id: found.id },
      data: { body: body.body, mentionedUserIds: body.mentionIds, editedAt: clock.now() },
      select: rowSelect,
    });
    changed(member.workspaceId, found.postId);
    const added = body.mentionIds.filter((id) => !found.mentionedUserIds.includes(id));
    if (added.length > 0) {
      await events.emit('post.commented', {
        workspaceId: member.workspaceId,
        postId: found.postId,
        commentId: found.id,
        userId: caller.user.id,
        mentionIds: added,
        edited: true,
      });
    }
    return toComment(row);
  }

  /**
   * A comment with replies stays as "Comment deleted"; otherwise it goes, and so does a deleted
   * parent left with no replies.
   */
  async function remove(caller: AuthContext, member: MemberContext, commentId: string) {
    const found = await own(caller, member, commentId);
    await db.client.$transaction(async (tx) => {
      const replies = await tx.postComment.count({
        where: { parentId: found.id, workspaceId: member.workspaceId },
      });
      if (replies > 0) {
        await tx.postComment.update({
          where: { id: found.id, workspaceId: member.workspaceId },
          data: { deletedAt: clock.now(), body: '', mentionedUserIds: [] },
        });
        return;
      }
      await tx.postComment.delete({ where: { id: found.id, workspaceId: member.workspaceId } });
      if (found.parentId) {
        await tx.postComment.deleteMany({
          where: {
            id: found.parentId,
            workspaceId: member.workspaceId,
            deletedAt: { not: null },
            replies: { none: {} },
          },
        });
      }
    });
    changed(member.workspaceId, found.postId);
  }

  return { list, mentionable, create, update, remove };
}

export type CommentService = ReturnType<typeof createCommentService>;
