import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export const commentKeys = {
  /** Everything about one post's comments: its thread and who can be mentioned. */
  post: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'comments', postId] as const,
  thread: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'comments', postId, 'thread'] as const,
  people: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'comments', postId, 'people'] as const,
};

/** A post's comments, oldest first, each followed by its replies. */
export const commentsQuery = (workspaceId: string, postId: string) =>
  queryOptions({
    queryKey: commentKeys.thread(workspaceId, postId),
    queryFn: async ({ signal }) =>
      (
        await api(apiRoutes.approvals.listComments, {
          params: { workspaceId, postId },
          signal,
        })
      ).items,
  });

/** The members who can see the post, and so can be @mentioned on it. */
export const mentionableQuery = (workspaceId: string, postId: string) =>
  queryOptions({
    queryKey: commentKeys.people(workspaceId, postId),
    queryFn: async ({ signal }) =>
      (
        await api(apiRoutes.approvals.listMentionable, {
          params: { workspaceId, postId },
          signal,
        })
      ).items,
    staleTime: 5 * 60_000,
  });
