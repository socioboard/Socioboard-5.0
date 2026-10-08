import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { TargetOptions } from './network-options';
import { NetworkId } from './networks';
import { Recurrence } from './recurrence';
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
/** Labels of the workspace (P1-B11), at most 20 per post. */
const LabelIds = z
  .array(Id)
  .max(20)
  .refine((ids) => new Set(ids).size === ids.length, 'The same label is chosen twice');

export const CreatePostBody = PostContent.partial().extend({
  text: Text.default(''),
  mediaIds: MediaIds.default([]),
  labelIds: LabelIds.default([]),
  targets: Targets.default([]),
});

/** `targets` replaces the whole selection: accounts left out are removed from the post. */
export const UpdatePostBody = PostContent.extend({ targets: Targets, labelIds: LabelIds })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

/**
 * Label colours are names, not hex values: the UI maps each to a shade that reads well in light
 * and dark themes (docs/frontend/design-system.md).
 */
export const LabelColor = z.enum([
  'gray',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'indigo',
  'violet',
  'pink',
]);
export type LabelColor = z.infer<typeof LabelColor>;

export const PostLabel = z.object({
  id: Id,
  name: z.string(),
  color: LabelColor,
  /** Posts that carry the label (shown when managing labels, before deleting one). */
  postCount: z.number().int().nonnegative(),
  createdAt: IsoDateTime,
});
export type PostLabel = z.infer<typeof PostLabel>;

const LabelName = z.string().trim().min(1).max(40);
export const CreateLabelBody = z.object({ name: LabelName, color: LabelColor });
export const UpdateLabelBody = z
  .object({ name: LabelName, color: LabelColor })
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
  /**
   * `template`: the post repeats (it holds the content and the rule; its copies go out).
   * `occurrence`: a copy a repeating post made for one of its dates. Null for an ordinary post.
   */
  recurring: z.enum(['template', 'occurrence']).nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Post = z.infer<typeof Post>;

/** One step of a post's review, kept as its full history (P4-B2). */
export const ReviewAction = z.enum(['submitted', 'approved', 'changes_requested', 'withdrawn']);
export type ReviewAction = z.infer<typeof ReviewAction>;

export const ReviewStep = z.object({
  id: Id,
  action: ReviewAction,
  /** Null once their account is gone. */
  actor: z.object({ id: Id, name: z.string(), avatarUrl: z.url().nullable() }).nullable(),
  /** The submitter's message, or the reviewer's reason for changes. */
  note: z.string().nullable(),
  createdAt: IsoDateTime,
});
export type ReviewStep = z.infer<typeof ReviewStep>;

/**
 * Where the post's review stands: whether it needs approval before it goes out (its author can't
 * publish, or the workspace reviews every post) and its latest review step.
 */
export const PostReview = z.object({ needed: z.boolean(), latest: ReviewStep.nullable() });
export type PostReview = z.infer<typeof PostReview>;

/** A post with each target's publishing history (newest attempt first) and its recurrence. */
export const PostDetails = Post.extend({
  targets: z.array(PostTarget.extend({ history: z.array(PublishAttempt) })),
  /** How the post repeats, if it does (phase 2). */
  recurrence: Recurrence.nullable(),
  /** Its review (phase 4). */
  review: PostReview,
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

  listLabels: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/labels',
    access: 'posts:read',
    summary: 'The workspace’s post labels, by name',
    params: workspaceParams,
    responses: { 200: z.object({ items: z.array(PostLabel) }) },
  }),
  createLabel: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/labels',
    access: 'posts:approve',
    summary: 'Add a label (names are unique in a workspace, ignoring case)',
    params: workspaceParams,
    body: CreateLabelBody,
    responses: { 201: PostLabel },
  }),
  updateLabel: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/labels/:labelId',
    access: 'posts:approve',
    summary: 'Rename or recolour a label',
    params: workspaceParams.extend({ labelId: Id }),
    body: UpdateLabelBody,
    responses: { 200: PostLabel },
  }),
  deleteLabel: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/labels/:labelId',
    access: 'posts:approve',
    summary: 'Delete a label; posts that carried it keep everything else',
    params: workspaceParams.extend({ labelId: Id }),
    responses: { 204: null },
  }),
};
