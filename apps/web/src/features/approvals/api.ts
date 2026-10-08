import { apiRoutes, type PostStatus } from '@socioboard/contracts';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export type ReviewTab = 'pending' | 'decided';

export const approvalKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'reviews'] as const,
  list: (workspaceId: string, tab: ReviewTab) =>
    ['workspaces', workspaceId, 'reviews', 'list', tab] as const,
  pending: (workspaceId: string) => ['workspaces', workspaceId, 'reviews', '_pending'] as const,
  history: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'reviews', 'history', postId] as const,
  // Under the posts lists, so a save or a live status change refreshes it.
  mine: (workspaceId: string) => ['workspaces', workspaceId, 'posts', 'list', '_mine'] as const,
};

/** The review queue (`posts:approve`): waiting, the longest-waiting first, or decided. */
export const reviewsQuery = (workspaceId: string, tab: ReviewTab) =>
  infiniteQueryOptions({
    queryKey: approvalKeys.list(workspaceId, tab),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.approvals.listReviews, {
        params: { workspaceId },
        query: { status: tab, limit: 25, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

/** How many posts wait for review, for the sidebar (100 shows as "100+"). */
export const PENDING_COUNT_MAX = 100;
export const pendingReviewsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: approvalKeys.pending(workspaceId),
    queryFn: async ({ signal }) => {
      const page = await api(apiRoutes.approvals.listReviews, {
        params: { workspaceId },
        query: { status: 'pending', limit: PENDING_COUNT_MAX },
        signal,
      });
      return { count: page.items.length, more: page.nextCursor !== null };
    },
  });

/** A post's review steps, oldest first. */
export const reviewHistoryQuery = (workspaceId: string, postId: string) =>
  queryOptions({
    queryKey: approvalKeys.history(workspaceId, postId),
    queryFn: async ({ signal }) =>
      (
        await api(apiRoutes.approvals.listPostReview, {
          params: { workspaceId, postId },
          signal,
        })
      ).items,
  });

/** What a contributor sent for review, and what came back approved. */
const MINE: PostStatus[] = ['in_review', 'approved', 'scheduled'];
export const mySubmissionsQuery = (workspaceId: string, userId: string) =>
  infiniteQueryOptions({
    queryKey: approvalKeys.mine(workspaceId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.posts.listPosts, {
        params: { workspaceId },
        query: {
          status: MINE,
          authorId: userId,
          limit: 25,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
