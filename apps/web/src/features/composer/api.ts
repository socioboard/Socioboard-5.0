import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export const postKeys = {
  detail: (workspaceId: string, postId: string) =>
    ['workspaces', workspaceId, 'posts', 'detail', postId] as const,
};

export const postQuery = (workspaceId: string, postId: string) =>
  queryOptions({
    queryKey: postKeys.detail(workspaceId, postId),
    queryFn: ({ signal }) =>
      api(apiRoutes.posts.getPost, { params: { workspaceId, postId }, signal }),
  });
