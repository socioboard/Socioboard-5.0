import type { NetworkId } from '@socioboard/contracts';

import { typedEvents, type Db, type EventBus, type Logger } from '../../platform';
import type { PublishingEvents } from '../publishing';
import type { SocialAccountEvents } from '../social-accounts';
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
    const post = await db.client.post.findFirst({
      where: { id: p.postId, workspaceId: p.workspaceId },
      select: { authorId: true },
    });
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
    });
  });

  logger.debug('notification listeners registered');
}
