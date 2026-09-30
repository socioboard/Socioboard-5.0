import { z } from 'zod';

import { Id, IsoDateTime, PageQuery } from './common';
import { NetworkId } from './networks';
import { PublishError, PublishErrorKind, TargetStatus } from './posts';
import { defineRoute } from './route';
import { AccountStatus } from './social-accounts';

/**
 * The platform admin console, v1 (docs/backend/modules/admin.md): Socioboard staff watching
 * publishing across every workspace. Only platform admins with 2FA; under /api/admin, outside
 * the versioned API. Responses never carry tokens, secrets or post content: an admin sees that a
 * delivery failed and why, not what the customer wrote. Bull Board is mounted at
 * /api/admin/queues (a UI, not a contract route).
 */

/** The workspace something belongs to, as the console shows it. */
const AdminWorkspace = z.object({ id: Id, slug: z.string(), name: z.string() });

export const QueueCounts = z.object({
  name: z.string(),
  waiting: z.number().int().nonnegative(),
  delayed: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type QueueCounts = z.infer<typeof QueueCounts>;

/** Counts over the last 24 hours (no timezone to argue about). Phase 5 adds AI usage and MRR. */
export const AdminOverview = z.object({
  generatedAt: IsoDateTime,
  signups24h: z.number().int().nonnegative(),
  /** Workspaces with a post published in the last 30 days. */
  activeWorkspaces30d: z.number().int().nonnegative(),
  published24h: z.number().int().nonnegative(),
  failed24h: z.number().int().nonnegative(),
  /** Targets in `publishing` for over 15 minutes: the reconcile job should be picking them up. */
  stuckTargets: z.number().int().nonnegative(),
  /** Accounts that need reconnecting, or whose token expires within 7 days. */
  accountsNeedingAttention: z.number().int().nonnegative(),
  queues: z.array(QueueCounts),
});
export type AdminOverview = z.infer<typeof AdminOverview>;

export const HealthRange = z.enum(['24h', '7d', '30d']);
export type HealthRange = z.infer<typeof HealthRange>;

export const PublishingHealthQuery = z.object({
  range: HealthRange.default('24h'),
  network: NetworkId.optional(),
});

export const NetworkHealth = z.object({
  network: NetworkId,
  published: z.number().int().nonnegative(),
  /** Finally failed (retries used up, or an error that isn't retried). */
  failed: z.number().int().nonnegative(),
  /** Attempts that failed and were retried, whatever the end result. */
  retried: z.number().int().nonnegative(),
  /** published / (published + failed); null when nothing finished in the range. */
  successRate: z.number().min(0).max(1).nullable(),
  /** The most common final errors, most frequent first (at most 5). */
  topErrors: z
    .array(
      z.object({
        kind: PublishErrorKind,
        networkCode: z.string().nullable(),
        message: z.string(),
        count: z.number().int().positive(),
      }),
    )
    .max(5),
});
export type NetworkHealth = z.infer<typeof NetworkHealth>;

export const PublishingHealth = z.object({
  range: HealthRange,
  generatedAt: IsoDateTime,
  /** Every network with activity in the range (or just the one asked for). */
  networks: z.array(NetworkHealth),
});
export type PublishingHealth = z.infer<typeof PublishingHealth>;

/** `failed`: finally failed; `stuck`: publishing for over 15 minutes. */
export const ProblemState = z.enum(['failed', 'stuck']);

export const ListProblemTargetsQuery = PageQuery.extend({
  state: ProblemState.optional(),
  network: NetworkId.optional(),
  errorKind: PublishErrorKind.optional(),
  workspaceId: Id.optional(),
});

/** A delivery that went wrong, without the post's content. */
export const AdminTarget = z.object({
  id: Id,
  postId: Id,
  workspace: AdminWorkspace,
  account: z.object({
    id: Id,
    network: NetworkId,
    displayName: z.string(),
    username: z.string().nullable(),
    status: AccountStatus,
  }),
  status: TargetStatus,
  stuck: z.boolean(),
  scheduledAt: IsoDateTime.nullable(),
  attempts: z.number().int().nonnegative(),
  lastAttemptAt: IsoDateTime.nullable(),
  lastError: PublishError.nullable(),
});
export type AdminTarget = z.infer<typeof AdminTarget>;

export const AdminTargetPage = z.object({
  items: z.array(AdminTarget),
  nextCursor: z.string().nullable(),
});

/** Every admin action says why; the reason is kept in the audit log. */
export const AdminActionBody = z.object({ reason: z.string().trim().min(3).max(500) });
export type AdminActionBody = z.infer<typeof AdminActionBody>;

export const ListAttentionAccountsQuery = PageQuery.extend({
  /** `expiring`: the token expires within `withinDays`; `reauth_required`: already broken. */
  state: z.enum(['expiring', 'reauth_required']).optional(),
  withinDays: z.coerce.number().int().min(1).max(60).default(7),
  network: NetworkId.optional(),
});

export const AdminAccount = z.object({
  id: Id,
  workspace: AdminWorkspace,
  network: NetworkId,
  displayName: z.string(),
  username: z.string().nullable(),
  status: AccountStatus,
  /** The network's reason, when it gave one. */
  statusReason: z.string().nullable(),
  tokenExpiresAt: IsoDateTime.nullable(),
  lastCheckedAt: IsoDateTime.nullable(),
  /** Scheduled targets that will fail unless the account is reconnected. */
  scheduledTargets: z.number().int().nonnegative(),
});
export type AdminAccount = z.infer<typeof AdminAccount>;

export const AdminAccountPage = z.object({
  items: z.array(AdminAccount),
  nextCursor: z.string().nullable(),
});

const targetParams = z.object({ targetId: Id });

export const adminRoutes = {
  getAdminOverview: defineRoute({
    method: 'GET',
    path: '/api/admin/overview',
    access: 'platform_admin',
    summary: 'Platform counts for the last 24 hours, and queue backlog',
    responses: { 200: AdminOverview },
  }),
  getPublishingHealth: defineRoute({
    method: 'GET',
    path: '/api/admin/publishing/health',
    access: 'platform_admin',
    summary: 'Success rate and top errors per network',
    query: PublishingHealthQuery,
    responses: { 200: PublishingHealth },
  }),
  listProblemTargets: defineRoute({
    method: 'GET',
    path: '/api/admin/publishing/failed',
    access: 'platform_admin',
    summary: 'Failed and stuck deliveries across workspaces, newest first',
    query: ListProblemTargetsQuery,
    responses: { 200: AdminTargetPage },
  }),
  adminRetryTarget: defineRoute({
    method: 'POST',
    path: '/api/admin/publishing/targets/:targetId/retry',
    access: 'platform_admin',
    summary: 'Publish a failed or stuck delivery again (audited)',
    params: targetParams,
    body: AdminActionBody,
    responses: { 202: AdminTarget },
  }),
  adminCancelTarget: defineRoute({
    method: 'POST',
    path: '/api/admin/publishing/targets/:targetId/cancel',
    access: 'platform_admin',
    summary: 'Stop a failed, stuck or scheduled delivery (audited)',
    params: targetParams,
    body: AdminActionBody,
    responses: { 200: AdminTarget },
  }),
  listAttentionAccounts: defineRoute({
    method: 'GET',
    path: '/api/admin/accounts/expiring',
    access: 'platform_admin',
    summary: 'Accounts whose token expires soon or that need reconnecting',
    query: ListAttentionAccountsQuery,
    responses: { 200: AdminAccountPage },
  }),
};
