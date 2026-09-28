import { apiRoutes, type MediaAsset, type MediaKind } from '@socioboard/contracts';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

/** Which assets the grid shows (all of them in the URL, so views can be shared). */
export interface MediaFilter {
  /** A folder id, or "root" for assets outside any folder; undefined for everything. */
  folder?: string | undefined;
  kind?: MediaKind | undefined;
  source?: 'upload' | 'ai' | undefined;
  q?: string | undefined;
}

export const mediaKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'media'] as const,
  lists: (workspaceId: string) => ['workspaces', workspaceId, 'media', 'list'] as const,
  list: (workspaceId: string, filter: MediaFilter) =>
    ['workspaces', workspaceId, 'media', 'list', filter] as const,
  detail: (workspaceId: string, assetId: string) =>
    ['workspaces', workspaceId, 'media', 'detail', assetId] as const,
  folders: (workspaceId: string) => ['workspaces', workspaceId, 'media', 'folders'] as const,
};

const PAGE_SIZE = 40;

/** Still being made: the grid re-asks until the server marks it ready or failed. */
export const isPending = (asset: MediaAsset) =>
  asset.status === 'uploading' || asset.status === 'processing';

export const mediaListQuery = (workspaceId: string, filter: MediaFilter) =>
  infiniteQueryOptions({
    queryKey: mediaKeys.list(workspaceId, filter),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.media.listMedia, {
        params: { workspaceId },
        query: {
          limit: PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filter.folder ? { folderId: filter.folder } : {}),
          ...(filter.kind ? { kind: filter.kind } : {}),
          ...(filter.source ? { source: filter.source } : {}),
          ...(filter.q ? { q: filter.q } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Until live updates arrive (P2-F5), poll while anything on screen is still processing.
    refetchInterval: (query) =>
      query.state.data?.pages.some((p) => p.items.some(isPending)) ? 3000 : false,
  });

export const mediaDetailQuery = (workspaceId: string, assetId: string) =>
  queryOptions({
    queryKey: mediaKeys.detail(workspaceId, assetId),
    queryFn: ({ signal }) =>
      api(apiRoutes.media.getMedia, { params: { workspaceId, assetId }, signal }),
  });

export const foldersQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: mediaKeys.folders(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.media.listFolders, { params: { workspaceId }, signal })).items,
  });
