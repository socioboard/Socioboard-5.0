import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { Post } from './posts';
import { defineRoute } from './route';
import { SchedulePostBody } from './scheduling';

// The review workflow and the comments on a post (P4-C1, docs/backend/modules/approvals.md).

/** Someone shown beside a review step or a comment; null once their account is gone. */
const Person = z.object({ id: Id, name: z.string(), avatarUrl: z.url().nullable() });

export const REVIEW_NOTE_MAX = 2_000;
const Note = z.string().trim().max(REVIEW_NOTE_MAX);

/** One step of a post's review, kept as its full history. */
export const ReviewAction = z.enum(['submitted', 'approved', 'changes_requested', 'withdrawn']);
export type ReviewAction = z.infer<typeof ReviewAction>;

export const ReviewStep = z.object({
  id: Id,
  action: ReviewAction,
  actor: Person.nullable(),
  /** The submitter's message, or the reviewer's reason for changes. */
  note: z.string().nullable(),
  createdAt: IsoDateTime,
});
export type ReviewStep = z.infer<typeof ReviewStep>;

export const SubmitPostBody = z.object({ note: Note.optional() });

/**
 * Approve, and optionally schedule in the same call ("Approve & schedule"). Without `schedule`
 * the post waits as approved for someone to schedule or publish it.
 */
export const ApprovePostBody = z.object({
  note: Note.optional(),
  schedule: SchedulePostBody.optional(),
});
export type ApprovePostBody = z.infer<typeof ApprovePostBody>;

/** Changes always say why. */
export const RequestChangesBody = z.object({ note: Note.min(1) });

/** A post waiting for review, or one this reviewer decided. */
export const ReviewItem = z.object({
  post: Post,
  submittedBy: Person.nullable(),
  submittedAt: IsoDateTime,
  /** The latest step: `submitted` while it waits. */
  latest: ReviewStep,
});
export type ReviewItem = z.infer<typeof ReviewItem>;

export const ListReviewsQuery = PageQuery.extend({
  /** `pending`: waiting for review, oldest first. `decided`: approved or sent back, newest first. */
  status: z.enum(['pending', 'decided']).default('pending'),
});

// ── Comments ────────────────────────────────────────────────────────────────────────────────────

export const COMMENT_MAX = 5_000;
export const COMMENT_MAX_MENTIONS = 20;

const CommentBody = z.string().trim().min(1).max(COMMENT_MAX);
/** User ids of the people @mentioned; each must be a member of the workspace. */
const MentionIds = z
  .array(Id)
  .max(COMMENT_MAX_MENTIONS)
  .refine((ids) => new Set(ids).size === ids.length, 'The same person is mentioned twice');

export const PostComment = z.object({
  id: Id,
  postId: Id,
  /** Replies are one level deep: a reply's parent is always a top-level comment. */
  parentId: Id.nullable(),
  author: Person.nullable(),
  /** Empty once deleted; a deleted comment with replies stays as "Comment deleted". */
  body: z.string(),
  mentions: z.array(z.object({ id: Id, name: z.string() })),
  createdAt: IsoDateTime,
  editedAt: IsoDateTime.nullable(),
  deletedAt: IsoDateTime.nullable(),
});
export type PostComment = z.infer<typeof PostComment>;

export const CreateCommentBody = z.object({
  body: CommentBody,
  parentId: Id.optional(),
  mentionIds: MentionIds.default([]),
});
export type CreateCommentBody = z.infer<typeof CreateCommentBody>;

export const UpdateCommentBody = z.object({
  body: CommentBody,
  mentionIds: MentionIds.default([]),
});
export type UpdateCommentBody = z.infer<typeof UpdateCommentBody>;

const workspaceParams = z.object({ workspaceId: Id });
const postParams = workspaceParams.extend({ postId: Id });
const commentParams = workspaceParams.extend({ commentId: Id });

export const approvalRoutes = {
  submitPost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/submit',
    // The author: checked in the service.
    access: 'posts:create',
    summary: 'Send a draft for review',
    params: postParams,
    body: SubmitPostBody,
    responses: { 200: Post },
  }),
  approvePost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/approve',
    access: 'posts:approve',
    summary: 'Approve a post in review, and optionally schedule it',
    params: postParams,
    body: ApprovePostBody,
    responses: { 200: Post },
  }),
  requestChanges: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/request-changes',
    access: 'posts:approve',
    summary: 'Send a post in review back to its author with a note',
    params: postParams,
    body: RequestChangesBody,
    responses: { 200: Post },
  }),
  withdrawPost: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/withdraw',
    // The author: checked in the service.
    access: 'posts:update-own',
    summary: 'Take a post out of review, back to draft',
    params: postParams,
    responses: { 200: Post },
  }),
  listPostReview: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/review',
    access: 'posts:read',
    summary: "A post's review history, oldest first",
    params: postParams,
    responses: { 200: z.object({ items: z.array(ReviewStep) }) },
  }),
  listReviews: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/reviews',
    access: 'posts:approve',
    summary: 'The review queue: posts waiting for review, or recently decided',
    params: workspaceParams,
    query: ListReviewsQuery,
    responses: { 200: page(ReviewItem) },
  }),

  listComments: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/comments',
    access: 'posts:read',
    summary: "A post's comments, oldest first, replies after their parent",
    params: postParams,
    responses: { 200: z.object({ items: z.array(PostComment) }) },
  }),
  createComment: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/posts/:postId/comments',
    // Viewers can comment too.
    access: 'posts:read',
    summary: 'Comment on a post, or reply to a comment; @mentions are notified',
    params: postParams,
    body: CreateCommentBody,
    responses: { 201: PostComment },
  }),
  updateComment: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/comments/:commentId',
    // Its author: checked in the service.
    access: 'posts:read',
    summary: 'Edit your own comment',
    params: commentParams,
    body: UpdateCommentBody,
    responses: { 200: PostComment },
  }),
  deleteComment: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/comments/:commentId',
    // Its author: checked in the service.
    access: 'posts:read',
    summary: 'Delete your own comment',
    params: commentParams,
    responses: { 204: null },
  }),
};
