import { can, type NetworkId } from '@socioboard/contracts';

import { typedEvents, type Db, type EventBus, type Logger } from '../../platform';
import type { PostEvents } from '../posts';
import type { PublishingEvents } from '../publishing';
import type { SocialAccountEvents } from '../social-accounts';
import type { TaskEvents } from '../tasks';
import { membersWhoSeePost } from '../workspaces';
import type { NotificationService } from './service';

/** How notifications name networks (the English fallback; the UI words them itself). */
const NETWORK_NAMES: Record<NetworkId, string> = {
  facebook_page: 'Facebook',
  instagram: 'Instagram',
  linkedin_person: 'LinkedIn',
  linkedin_org: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  tumblr: 'Tumblr',
  threads: 'Threads',
};

/** Who "workspace admins" are in the event map. */
const ADMIN_ROLES = ['owner', 'admin'];

/**
 * The event → notification map (docs/backend/modules/notifications.md). Other modules only emit
 * events; this decides who hears about what. Registered in the API and the worker, since events
 * are emitted in both (a failed delivery in the worker, a refused login in the API). A listener
 * that fails is logged by the bus and never fails what emitted the event.
 */
export function registerNotificationListeners(
  bus: EventBus<Record<string, unknown>>,
  notifications: Pick<NotificationService, 'notify'>,
  db: Db,
  logger: Logger,
) {
  /** The live workspace, its admins, and which of `userIds` are still members. */
  async function audience(workspaceId: string, userIds: (string | null)[] = []) {
    const workspace = await db.client.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        slug: true,
        name: true,
        deletedAt: true,
        members: { select: { userId: true, role: true } },
      },
    });
    if (!workspace || workspace.deletedAt) return null;
    const { members, deletedAt: _deleted, ...ws } = workspace;
    return {
      workspace: ws,
      admins: members.filter((m) => ADMIN_ROLES.includes(m.role)).map((m) => m.userId),
      members: members.map((m) => m.userId).filter((id) => userIds.includes(id)),
    };
  }

  const publishing = typedEvents<PublishingEvents>(bus);

  // A delivery failed for good: its author and the workspace's admins, by email too.
  publishing.on('target.failed', async (p) => {
    const [post, target] = await Promise.all([
      db.client.post.findFirst({
        where: { id: p.postId, workspaceId: p.workspaceId },
        select: { authorId: true },
      }),
      db.client.postTarget.findFirst({
        where: { id: p.targetId, workspaceId: p.workspaceId },
        select: { account: { select: { displayName: true } } },
      }),
    ]);
    const who = await audience(p.workspaceId, [post?.authorId ?? null]);
    if (!post || !who) return;
    const network = NETWORK_NAMES[p.network];
    await notifications.notify({
      workspace: who.workspace,
      userIds: [...who.members, ...who.admins],
      type: 'publish_failed',
      title: `A post couldn’t be published to ${network}`,
      body: p.message,
      link: `/w/${who.workspace.slug}/posts/${p.postId}`,
      params: { postId: p.postId, targetId: p.targetId, network: p.network, kind: p.errorKind },
      group: `post:${p.postId}`,
      facts: { account: target?.account.displayName ?? network, network, reason: p.message },
    });
  });

  // Published: its author, in the app only by default.
  publishing.on('target.published', async (p) => {
    const post = await db.client.post.findFirst({
      where: { id: p.postId, workspaceId: p.workspaceId },
      select: { authorId: true },
    });
    const who = await audience(p.workspaceId, [post?.authorId ?? null]);
    if (!post || !who || who.members.length === 0) return;
    const network = NETWORK_NAMES[p.network];
    await notifications.notify({
      workspace: who.workspace,
      userIds: who.members,
      type: 'post_published',
      title: `Your post was published to ${network}`,
      body: `It’s live on ${network}.`,
      link: `/w/${who.workspace.slug}/posts/${p.postId}`,
      params: { postId: p.postId, targetId: p.targetId, network: p.network },
      group: `post:${p.postId}`,
    });
  });

  // An account needs reconnecting: the workspace's admins, by email too. A login's accounts
  // arrive together, so they share one email.
  typedEvents<SocialAccountEvents>(bus).on('account.reauth_required', async (p) => {
    const [who, account] = await Promise.all([
      audience(p.workspaceId),
      db.client.socialAccount.findFirst({
        where: { id: p.accountId, workspaceId: p.workspaceId },
        select: { displayName: true, network: true },
      }),
    ]);
    if (!who || !account) return;
    await notifications.notify({
      workspace: who.workspace,
      userIds: who.admins,
      type: 'account_reauth_required',
      title: `${account.displayName} needs reconnecting`,
      body: p.reason,
      link: `/w/${who.workspace.slug}/accounts?account=${p.accountId}`,
      params: {
        accountId: p.accountId,
        account: account.displayName,
        network: account.network,
      },
      group: `accounts:${p.workspaceId}`,
      facts: {
        account: account.displayName,
        network: NETWORK_NAMES[account.network],
        reason: p.reason,
      },
    });
  });

  // ── Review and comments (P4-B3) ──────────────────────────────────────────────────────────
  // Only people who can see the post hear about it (P4-B4), and never the one who acted. The
  // texts don't quote the post, a note or a comment: emails link to the app instead.

  /** The workspace, the post's author, who acted, and the members who can see the post. */
  async function aboutPost(workspaceId: string, postId: string, actorId: string) {
    const [who, post, actor, seers] = await Promise.all([
      audience(workspaceId),
      db.client.post.findFirst({ where: { id: postId, workspaceId }, select: { authorId: true } }),
      db.client.user.findUnique({ where: { id: actorId }, select: { name: true } }),
      membersWhoSeePost(db, workspaceId, postId),
    ]);
    if (!who || !post) return null;
    const sees = (userId: string | null) =>
      userId !== null && userId !== actorId && seers.some((m) => m.userId === userId);
    return {
      workspace: who.workspace,
      authorId: post.authorId,
      actor: actor?.name ?? 'Someone',
      seers: seers.filter((m) => sees(m.userId)),
      sees,
      link: `/w/${who.workspace.slug}/posts/${postId}`,
    };
  }

  const posts = typedEvents<PostEvents>(bus);

  // Sent for review: the members who can approve it.
  posts.on('post.submitted', async (p) => {
    const about = await aboutPost(p.workspaceId, p.postId, p.userId);
    if (!about) return;
    const approvers = about.seers.filter((m) => can(m.role, 'posts:approve')).map((m) => m.userId);
    if (approvers.length === 0) return;
    await notifications.notify({
      workspace: about.workspace,
      userIds: approvers,
      type: 'review_requested',
      title: `${about.actor} sent a post for review`,
      body: p.afterEdit
        ? 'It was approved, then edited, so it needs another look.'
        : 'Open it to approve it or ask for changes.',
      link: `/w/${about.workspace.slug}/approvals?post=${p.postId}`,
      params: { postId: p.postId, actor: about.actor, afterEdit: p.afterEdit ? 1 : 0 },
      group: `review:${p.workspaceId}`,
    });
  });

  // Decided: its author.
  posts.on('post.approved', async (p) => {
    const about = await aboutPost(p.workspaceId, p.postId, p.userId);
    const authorId = about?.authorId;
    if (!about || !authorId || !about.sees(authorId)) return;
    await notifications.notify({
      workspace: about.workspace,
      userIds: [authorId],
      type: 'post_approved',
      title: `${about.actor} approved your post`,
      body: 'It can be scheduled or published now.',
      link: about.link,
      params: { postId: p.postId, actor: about.actor },
      group: `post:${p.postId}`,
    });
  });

  posts.on('post.changes_requested', async (p) => {
    const about = await aboutPost(p.workspaceId, p.postId, p.userId);
    const authorId = about?.authorId;
    if (!about || !authorId || !about.sees(authorId)) return;
    await notifications.notify({
      workspace: about.workspace,
      userIds: [authorId],
      type: 'changes_requested',
      title: `${about.actor} asked for changes to your post`,
      body: 'Open it to see what to change, then send it again.',
      // To the composer, where the note shows at the top and the post can be fixed and resent.
      link: `/w/${about.workspace.slug}/compose/${p.postId}`,
      params: { postId: p.postId, actor: about.actor },
      group: `post:${p.postId}`,
    });
  });

  // A comment: whoever it mentions; on a new comment, also the post's author and everyone who
  // commented on it before (a mention wins, so nobody hears twice).
  posts.on('post.commented', async (p) => {
    const about = await aboutPost(p.workspaceId, p.postId, p.userId);
    if (!about) return;
    const mentioned = p.mentionIds.filter((id) => about.sees(id));
    const others: string[] = [];
    if (!p.edited) {
      const earlier = await db.client.postComment.findMany({
        where: { workspaceId: p.workspaceId, postId: p.postId, authorId: { not: null } },
        select: { authorId: true },
        distinct: ['authorId'],
      });
      for (const id of [about.authorId, ...earlier.map((c) => c.authorId)]) {
        if (id && about.sees(id) && !mentioned.includes(id) && !others.includes(id)) {
          others.push(id);
        }
      }
    }
    const params = { postId: p.postId, commentId: p.commentId, actor: about.actor };
    const link = `${about.link}?comment=${p.commentId}`;
    if (mentioned.length > 0) {
      await notifications.notify({
        workspace: about.workspace,
        userIds: mentioned,
        type: 'mentioned',
        title: `${about.actor} mentioned you in a comment`,
        body: 'Open the post to read it and reply.',
        link,
        params,
        group: `post:${p.postId}`,
      });
    }
    // The author reads "your post"; others "a post you commented on".
    for (const [userIds, whose] of [
      [others.filter((id) => id === about.authorId), 'your post'],
      [others.filter((id) => id !== about.authorId), 'a post you commented on'],
    ] as const) {
      if (userIds.length === 0) continue;
      await notifications.notify({
        workspace: about.workspace,
        userIds,
        type: 'post_commented',
        title: `${about.actor} commented on ${whose}`,
        body: 'Open the post to read it and reply.',
        link,
        params: { ...params, own: whose === 'your post' ? 1 : 0 },
        group: `post:${p.postId}`,
      });
    }
  });

  // ── Tasks (P4-B5) ───────────────────────────────────────────────────────────────────────
  // To one person, if they're still a member and, for a task about a post, can see it. The
  // English text (also the email's) leaves the task's title out; the app shows it from params.

  /** The workspace, the task, and whether `userId` may hear of it. */
  async function aboutTask(workspaceId: string, taskId: string, userId: string) {
    const [who, task] = await Promise.all([
      audience(workspaceId, [userId]),
      db.client.task.findFirst({
        where: { id: taskId, workspaceId },
        select: { title: true, postId: true, dueAt: true },
      }),
    ]);
    if (!who || !task || who.members.length === 0) return null;
    if (task.postId) {
      const seers = await membersWhoSeePost(db, workspaceId, task.postId);
      const postGone = !(await db.client.post.findFirst({
        where: { id: task.postId, workspaceId },
        select: { id: true },
      }));
      if (!postGone && !seers.some((m) => m.userId === userId)) return null;
    }
    return {
      workspace: who.workspace,
      task,
      link: `/w/${who.workspace.slug}/tasks?task=${taskId}`,
    };
  }
  const nameOf = async (userId: string) =>
    (await db.client.user.findUnique({ where: { id: userId }, select: { name: true } }))?.name ??
    'Someone';

  const tasks = typedEvents<TaskEvents>(bus);

  tasks.on('task.assigned', async (p) => {
    if (p.assigneeId === p.userId) return;
    const about = await aboutTask(p.workspaceId, p.taskId, p.assigneeId);
    if (!about) return;
    const actor = await nameOf(p.userId);
    await notifications.notify({
      workspace: about.workspace,
      userIds: [p.assigneeId],
      type: 'task_assigned',
      title: `${actor} gave you a task`,
      body: about.task.dueAt ? 'It has a due date: open it to see.' : 'Open it to see what to do.',
      link: about.link,
      params: { taskId: p.taskId, actor, task: about.task.title },
      group: `task:${p.taskId}`,
    });
  });

  tasks.on('task.completed', async (p) => {
    if (!p.createdById || p.createdById === p.userId) return;
    const about = await aboutTask(p.workspaceId, p.taskId, p.createdById);
    if (!about) return;
    const actor = await nameOf(p.userId);
    await notifications.notify({
      workspace: about.workspace,
      userIds: [p.createdById],
      type: 'task_completed',
      title: `${actor} finished a task you made`,
      body: 'Open it to see.',
      link: about.link,
      params: { taskId: p.taskId, actor, task: about.task.title },
      group: `task:${p.taskId}`,
    });
  });

  tasks.on('task.due', async (p) => {
    const about = await aboutTask(p.workspaceId, p.taskId, p.assigneeId);
    if (!about) return;
    await notifications.notify({
      workspace: about.workspace,
      userIds: [p.assigneeId],
      type: 'task_due',
      title: 'A task of yours is due within a day',
      body: 'Open it to see what’s left to do.',
      link: about.link,
      params: { taskId: p.taskId, task: about.task.title, dueAt: p.dueAt },
      group: `task:${p.taskId}`,
    });
  });

  logger.debug('notification listeners registered');
}
