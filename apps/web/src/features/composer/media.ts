import type { MediaAssetDetails } from '@socioboard/contracts';
import { useQueries } from '@tanstack/react-query';

import { isPending, mediaDetailQuery } from '../media';

/**
 * The attached files' details, in order, for the media strip and the previews (the same cached
 * queries). Re-asked every 3 s while a file is processing; a deleted file answers 404 once.
 */
export function useAttachedMedia(workspaceId: string, mediaIds: string[]) {
  return useQueries({
    queries: mediaIds.map((id) => ({
      ...mediaDetailQuery(workspaceId, id),
      refetchInterval: (query: { state: { data?: MediaAssetDetails | undefined } }) =>
        query.state.data && isPending(query.state.data) ? 3000 : false,
      retry: false,
    })),
  });
}
