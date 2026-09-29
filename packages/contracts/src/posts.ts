import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { NetworkId } from './networks';
import { AccountStatus } from './social-accounts';
import { defineRoute } from './route';

/**
 * Derived from the targets (docs/backend/modules/posts.md): draft → in_review → approved →
 * scheduled → publishing → published / partial / failed. Review arrives in phase 4, scheduling
 * in phase 2.
 */
export const PostStatus = z.enum([
  'draft',
  'in_review',
  'approved',
  'scheduled',
  'publishing',
  'published',
  'partial',
  'failed',
]);
export type PostStatus = z.infer<typeof PostStatus>;

export const TargetStatus = z.enum([
  'pending',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled',
]);
export type TargetStatus = z.infer<typeof TargetStatus>;

/** Limits of our own; each network's limits are stricter and checked by validation. */
export const POST_MAX_TEXT = 70_000;
export const POST_MAX_MEDIA = 20;

const Text = z.string().max(POST_MAX_TEXT);
const MediaIds = z
  .array(Id)
  .max(POST_MAX_MEDIA)
  .refine((ids) => new Set(ids).size === ids.length, 'The same file is attached twice');

/** Instagram: a feed post (one file, or a carousel of 2–10), a reel or a story. */
export const InstagramFormat = z.enum(['feed', 'reel', 'story']);

/**
 * Network-specific settings, under the key of the target account's network (the API rejects
 * keys for other networks). Phase 3 adds Pinterest, YouTube and TikTok options.
 */
export const TargetOptions = z.object({
  instagram: z.object({ format: InstagramFormat }).partial().optional(),
});
export type TargetOptions = z.infer<typeof TargetOptions>;

/** What one network gets instead of the shared content. Unset fields use the shared content. */
export const TargetOverride = z.object({
  text: Text.optional(),
  mediaIds: MediaIds.optional(),
  options: TargetOptions.optional(),
});
export type TargetOverride = z.infer<typeof TargetOverride>;

/** The shared content of a post. */
const PostContent = z.object({
  text: Text,
  mediaIds: MediaIds,
  link: z
    .url({ protocol: /^https?$/ })
    .max(2048)
    .nullable(),
  firstComment: z.string().max(POST_MAX_TEXT).nullable(),
});

export const TargetInput = z.object({
  accountId: Id,
  override: TargetOverride.nullable().default(null),
});
export type TargetInput = z.infer<typeof TargetInput>;

const Targets = z
  .array(TargetInput)
  .max(100)
  .refine(
    (targets) => new Set(targets.map((t) => t.accountId)).size === targets.length,
    'The same account is selected twice',
  );

/** A draft may have no text, media or accounts yet; publishing checks it's complete. */
export const CreatePostBody = PostContent.partial().extend({
  text: Text.default(''),
  mediaIds: MediaIds.default([]),
  targets: Targets.default([]),
});

/** `targets` replaces the whole selection: accounts left out are removed from the post. */
export const UpdatePostBody = PostContent.extend({ targets: Targets })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

export const ValidationSeverity = z.enum(['error', 'warning']);

/**
 * A problem with the content for one network. Errors block publishing to that network; warnings
 * don't. `code` (e.g. TEXT_TOO_LONG) and `params` let the UI word it; `message` is the fallback.
 */
export const ValidationIssue = z.object({
  severity: ValidationSeverity,
  code: z.string(),
  message: z.string(),
  field: z.enum(['text', 'media', 'link', 'firstComment', 'options', 'account']).nullable(),
  /** Which attached file, for media issues. */
  mediaId: Id.nullable(),
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});
export type ValidationIssue = z.infer<typeof ValidationIssue>;

export const ValidatePostBody = PostContent.extend({ targets: Targets });

export const ValidatePostResponse = z.object({
  /** Problems with the post as a whole (e.g. no accounts selected). */
  issues: z.array(ValidationIssue),
  targets: z.array(
    z.object({ accountId: Id, network: NetworkId, issues: z.array(ValidationIssue) }),
  ),
});
export type ValidatePostResponse = z.infer<typeof ValidatePostResponse>;

/**
 * Why a delivery failed, as the publishing worker classified it: `retryable` and `rate_limited`
 * are retried, `auth` needs the account reconnected, `content` needs the post changed.
 */
export const PublishErrorKind = z.enum(['retryable', 'rate_limited', 'auth', 'content']);
export type PublishErrorKind = z.infer<typeof PublishErrorKind>;

export const PublishError = z.object({
  kind: PublishErrorKind,
  /** The network's own error code, when it gave one. */
  networkCode: z.string().nullable(),
  message: z.string(),
});
export type PublishError = z.infer<typeof PublishError>;

export const PublishAttempt = z.object({
  id: Id,
  attemptNo: z.number().int().positive(),
  startedAt: IsoDateTime,
  finishedAt: IsoDateTime.nullable(),
  outcome: z.enum(['running', 'published', 'failed', 'will_retry']),
  error: PublishError.nullable(),
});
export type PublishAttempt = z.infer<typeof PublishAttempt>;

/** The account a target goes to, as much as a post needs to show it. */
export const TargetAccount = z.object({
  id: Id,
  network: NetworkId,
  displayName: z.string(),
  username: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  status: AccountStatus,
});

export const PostTarget = z.object({
  id: Id,
  account: TargetAccount,
  override: TargetOverride.nullable(),
  status: TargetStatus,
  scheduledAt: IsoDateTime.nullable(),
  externalPostId: z.string().nullable(),
  permalink: z.url().nullable(),
  attempts: z.number().int().nonnegative(),
  lastError: PublishError.nullable(),
  publishedAt: IsoDateTime.nullable(),
});
export type PostTarget = z.infer<typeof PostTarget>;

export const Post = PostContent.extend({
  id: Id,
  status: PostStatus,
  labelIds: z.array(Id),
  author: z.object({ id: Id, name: z.string(), avatarUrl: z.url().nullable() }).nullable(),
  targets: z.array(PostTarget),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Post = z.infer<typeof Post>;

/** A post with each target's publishing history, newest attempt first. */
export const PostDetails = Post.extend({
  targets: z.array(PostTarget.extend({ history: z.array(PublishAttempt) })),
});
export type PostDetails = z.infer<typeof PostDetails>;

export const ListPostsQuery = PageQuery.extend({
  status: z
    .union([PostStatus, z.array(PostStatus)])
    .transform((s) => (Array.isArray(s) ? s : [s]))
    .optional(),
  accountId: Id.optional(),
  authorId: Id.optional(),
  labelId: Id.optional(),
  /** Created (drafts), scheduled or published within this range. */
  from: IsoDateTime.optional(),
  to: IsoDateTime.optional(),
});

const workspaceParams = z.object({ workspaceId: Id });
const postParams = workspaceParams.extend({ postId: Id });

// `/posts/validate` is listed before `/posts/:postId` so a router matches it first.
export const postRoutes = {
  validatePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/validate',
    access: 'posts:create',
    summary: 'Check content against each selected network without saving',
    params: workspaceParams,
    body: ValidatePostBody,
    responses: { 200: ValidatePostResponse },
  }),
  createPost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts',
    access: 'posts:create',
    summary: 'Create a draft with its target accounts',
    params: workspaceParams,
    body: CreatePostBody,
    responses: { 201: Post },
  }),
  listPosts: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/posts',
    access: 'posts:read',
    summary: 'List posts, newest first (filter by status, account, author, label, dates)',
    params: workspaceParams,
    query: ListPostsQuery,
    responses: { 200: page(Post) },
  }),
  getPost: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId',
    access: 'posts:read',
    summary: 'Post with its targets and publishing history',
    params: postParams,
    responses: { 200: PostDetails },
  }),
  updatePost: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId',
    // The author, or `posts:approve`: checked in the service.
    access: 'posts:update-own',
    summary: 'Edit content, accounts or overrides (not while publishing)',
    params: postParams,
    body: UpdatePostBody,
    responses: { 200: Post },
  }),
  deletePost: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId',
    // The author, or `posts:approve`: checked in the service.
    access: 'posts:update-own',
    summary: 'Delete a draft, or cancel a scheduled post',
    params: postParams,
    responses: { 204: null },
  }),
  duplicatePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/duplicate',
    access: 'posts:create',
    summary: 'Copy a post as a new draft',
    params: postParams,
    responses: { 201: Post },
  }),
  publishNow: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/publish-now',
    access: 'posts:publish',
    summary:
      'Publish to every target now; send an Idempotency-Key header so a repeat does not post twice',
    params: postParams,
    responses: { 202: Post },
  }),
  retryTarget: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/targets/:targetId/retry',
    access: 'posts:publish',
    summary: 'Publish a failed target again',
    params: postParams.extend({ targetId: Id }),
    responses: { 202: Post },
  }),
};
