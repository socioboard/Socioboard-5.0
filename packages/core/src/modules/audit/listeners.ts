import type { EventBus, Logger } from '../../platform';
import type { AuthEvents } from '../auth';
import type { MediaEvents } from '../media';
import type { PostEvents } from '../posts';
import type { SchedulingEvents } from '../scheduling';
import type { SocialAccountEvents } from '../social-accounts';
import type { WorkspaceEvents } from '../workspaces';
import type { AuditEntry, AuditLog } from './service';

type AllEvents = AuthEvents &
  WorkspaceEvents &
  MediaEvents &
  SocialAccountEvents &
  PostEvents &
  SchedulingEvents;
/** The real event names, without the `Record<string, unknown>` index signature the maps extend. */
type EventName = keyof { [K in keyof AllEvents as string extends K ? never : K]: true };
type Mapping = {
  [K in EventName]?: (payload: AllEvents[K]) => Omit<AuditEntry, 'action'>;
};

const user = (userId: string) => ({ userId, type: 'user' as const });

/**
 * Which events become audit entries, and how. Typed against each module's event map, so a changed
 * payload breaks the build here instead of silently recording the wrong thing. Operational events
 * (media.ready, media.failed) are not audited.
 */
export const AUDITED: Mapping = {
  'user.signed_up': (p) => ({
    workspaceId: null,
    actor: user(p.userId),
    entity: { type: 'user', id: p.userId },
    diff: { email: p.email },
  }),
  'user.signed_in': (p) => ({
    workspaceId: null,
    actor: user(p.userId),
    entity: { type: 'session', id: p.sessionId },
  }),
  'user.password_changed': (p) => ({
    workspaceId: null,
    actor: user(p.userId),
    entity: { type: 'user', id: p.userId },
  }),

  'workspace.created': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'workspace', id: p.workspaceId },
  }),
  'workspace.updated': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'workspace', id: p.workspaceId },
    diff: { fields: p.fields },
  }),
  'workspace.deleted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'workspace', id: p.workspaceId },
  }),
  'workspace.ownership_transferred': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.fromUserId),
    entity: { type: 'workspace', id: p.workspaceId },
    diff: { from: p.fromUserId, to: p.toUserId },
  }),

  'member.invited': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'invitation', id: p.invitationId },
    diff: { email: p.email, role: p.role },
  }),
  'member.joined': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'user', id: p.userId },
    diff: { role: p.role, invitationId: p.invitationId },
  }),
  'member.role_changed': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'member', id: p.memberId },
    diff: { from: p.from, to: p.to },
  }),
  'member.account_access_changed': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'member', id: p.memberId },
    diff: { accountIds: p.accountIds },
  }),
  'member.removed': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'member', id: p.memberId },
    diff: { removedUserId: p.removedUserId, left: p.removedUserId === p.userId },
  }),
  'invitation.revoked': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'invitation', id: p.invitationId },
  }),
  'invitation.declined': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'invitation', id: p.invitationId },
  }),

  'media.deleted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'media_asset', id: p.assetId },
  }),

  'connection.added': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'social_connection', id: p.connectionId },
    diff: { provider: p.provider },
  }),
  'connection.removed': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'social_connection', id: p.connectionId },
    diff: { provider: p.provider },
  }),
  'account.connected': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'social_account', id: p.accountId },
    diff: { network: p.network, connectionId: p.connectionId },
  }),
  'account.disconnected': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'social_account', id: p.accountId },
    diff: { network: p.network, cancelledTargets: p.cancelledTargetIds.length },
  }),
  'account_group.created': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'account_group', id: p.groupId },
    diff: { name: p.name, accounts: p.accounts },
  }),
  'account_group.updated': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'account_group', id: p.groupId },
    diff: { name: p.name, accounts: p.accounts },
  }),
  'account_group.deleted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'account_group', id: p.groupId },
    diff: { name: p.name },
  }),
  'post.created': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
  }),
  'post.updated': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { fields: p.fields },
  }),
  'post.publish_requested': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { targets: p.targetIds.length },
  }),
  'post.submitted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { afterEdit: p.afterEdit },
  }),
  'post.approved': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
  }),
  'post.changes_requested': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
  }),
  'post.withdrawn': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
  }),
  'label.created': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post_label', id: p.labelId },
    diff: { name: p.name },
  }),
  'label.updated': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post_label', id: p.labelId },
    diff: { fields: p.fields },
  }),
  'label.deleted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post_label', id: p.labelId },
    diff: { name: p.name },
  }),
  'post.scheduled': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { targets: p.targets },
  }),
  'post.rescheduled': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post_target', id: p.targetId },
    diff: { postId: p.postId, from: p.from, to: p.to },
  }),
  'post.recurrence_set': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { rrule: p.rrule, timezone: p.timezone },
  }),
  'post.recurrence_stopped': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { removedOccurrences: p.removedOccurrences },
  }),
  'queue_slots.updated': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'social_account', id: p.accountId },
    diff: { slots: p.slots, timezone: p.timezone },
  }),
  'post.unscheduled': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
    diff: { targets: p.targetIds.length },
  }),
  'post.deleted': (p) => ({
    workspaceId: p.workspaceId,
    actor: user(p.userId),
    entity: { type: 'post', id: p.postId },
  }),
  'account.reauth_required': (p) => ({
    workspaceId: p.workspaceId,
    actor: { userId: null, type: 'system' },
    entity: { type: 'social_account', id: p.accountId },
    diff: { connectionId: p.connectionId, reason: p.reason },
  }),
};

/** Subscribes the audit log to every audited event on the app-wide bus. */
export function registerAuditListeners(
  events: EventBus<Record<string, unknown>>,
  audit: AuditLog,
  logger: Logger,
) {
  for (const [action, toEntry] of Object.entries(AUDITED)) {
    events.on(action, async (payload) => {
      const entry = (toEntry as (p: unknown) => Omit<AuditEntry, 'action'>)(payload);
      await audit.record({ ...entry, action }).catch((err: unknown) => {
        // The action already happened; losing its audit line must be loud, not fatal.
        logger.error({ err, action }, 'audit entry could not be recorded');
      });
    });
  }
}
