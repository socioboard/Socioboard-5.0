import {
  apiRoutes,
  type Post,
  type PostDetails,
  type PostStatus,
  type Recurrence,
} from '@socioboard/contracts';
import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';

/**
 * The posts list's tabs (docs/frontend/areas/posts.md), each a set of post statuses. A partly
 * published post sits under Failed: something on it still needs fixing.
 */
export const POST_TABS = {
  all: undefined,
  drafts: ['draft', 'in_review', 'approved'],
  scheduled: ['scheduled'],
  published: ['publishing', 'published'],
  failed: ['failed', 'partial'],
} as const satisfies Record<string, readonly PostStatus[] | undefined>;
export type PostTab = keyof typeof POST_TABS;
export const isPostTab = (value: unknown): value is PostTab =>
  typeof value === 'string' && Object.hasOwn(POST_TABS, value);

export const postKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'posts'] as const,
  lists: (workspaceId: string) => ['workspaces', workspaceId, 'posts', 'list'] as const,
  list: (workspaceId: string, tab: PostTab, labelId?: string) =>
    ['workspaces', workspaceId, 'posts', 'list', tab, labelId ?? null] as const,
  // Under `lists`, so it's marked stale whenever a post is saved.
  any: (workspaceId: string) => ['workspaces', workspaceId, 'posts', 'list', '_any'] as const,
  detail: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'posts', 'detail', postId] as const,
};

const PAGE_SIZE = 25;

/** Being sent right now: screens showing it re-ask until it's done. */
export const isSending = (post: Post) =>
  post.status === 'publishing' || post.targets.some((t) => t.status === 'publishing');

// Until live updates arrive (socket `post.status_changed`, P2-F5), screens poll while a post they
// show is being sent.
const SENDING_POLL_MS = 3000;

export const postListQuery = (workspaceId: string, tab: PostTab, labelId?: string) =>
  infiniteQueryOptions({
    queryKey: postKeys.list(workspaceId, tab, labelId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => {
      const status = POST_TABS[tab];
      return api(apiRoutes.posts.listPosts, {
        params: { workspaceId },
        query: {
          limit: PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(status ? { status: [...status] } : {}),
          ...(labelId ? { labelId } : {}),
        },
        signal,
      });
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    refetchInterval: (query) =>
      query.state.data?.pages.some((p) => p.items.some(isSending)) ? SENDING_POLL_MS : false,
  });

/** Whether the workspace has any post yet (the getting-started checklist). */
export const hasPostsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: postKeys.any(workspaceId),
    queryFn: async ({ signal }) =>
      (
        await api(apiRoutes.posts.listPosts, {
          params: { workspaceId },
          query: { limit: 1 },
          signal,
        })
      ).items.length > 0,
  });

export const postQuery = (workspaceId: string, postId: string) =>
  queryOptions({
    queryKey: postKeys.detail(workspaceId, postId),
    queryFn: ({ signal }) =>
      api(apiRoutes.posts.getPost, { params: { workspaceId, postId }, signal }),
    refetchInterval: (query) =>
      query.state.data && isSending(query.state.data) ? SENDING_POLL_MS : false,
  });

/**
 * Keeps the cache in step after the server answered with a post (a save, publish or retry). Those
 * answers don't carry the publishing history or the recurrence, so what's already known is kept; a post being
 * sent is re-asked for every few seconds (postQuery), which brings the new attempts. Lists are
 * marked stale.
 */
export function rememberPost(queryClient: QueryClient, workspaceId: string, post: Post) {
  const key = postKeys.detail(workspaceId, post.id);
  queryClient.setQueryData<PostDetails>(key, (old) => ({
    ...post,
    targets: post.targets.map((t) => ({
      ...t,
      history: old?.targets.find((o) => o.id === t.id)?.history ?? [],
    })),
    recurrence: old?.recurrence ?? null,
  }));
  void queryClient.invalidateQueries({ queryKey: postKeys.lists(workspaceId) });
  void queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'calendar'] });
  void queryClient.invalidateQueries({
    queryKey: ['workspaces', workspaceId, 'accounts'],
    predicate: (q) => q.queryKey.at(-1) === 'queue-slots',
  });
}

/**
 * After a post was set to repeat, or stopped (null): its details carry the rule, and the lists
 * are marked stale (a rule makes a post for each of its dates; stopping removes those waiting).
 */
export function rememberRecurrence(
  queryClient: QueryClient,
  workspaceId: string,
  postId: string,
  recurrence: Recurrence | null,
) {
  queryClient.setQueryData<PostDetails>(postKeys.detail(workspaceId, postId), (old) =>
    old ? { ...old, recurrence, recurring: recurrence?.active ? 'template' : null } : old,
  );
  void queryClient.invalidateQueries({ queryKey: postKeys.lists(workspaceId) });
  void queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'calendar'] });
}
