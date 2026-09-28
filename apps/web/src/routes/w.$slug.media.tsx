import { MediaKind } from '@socioboard/contracts';
import { createFileRoute } from '@tanstack/react-router';

import { MediaPage, type MediaSearch } from '../features/media';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/media')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): MediaSearch => {
    const kind = MediaKind.safeParse(search.kind);
    return {
      folder: stringParam(search.folder, 64),
      kind: kind.success ? kind.data : undefined,
      source: search.source === 'upload' || search.source === 'ai' ? search.source : undefined,
      q: stringParam(search.q, 100),
      asset: stringParam(search.asset, 64),
    };
  },
  component: function Media() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
      <MediaPage
        search={search}
        onSearchChange={(patch) => {
          // Opening and closing details doesn't need a history entry each time; filters do.
          const replace = Object.keys(patch).every((key) => key === 'asset');
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace });
        }}
      />
    );
  },
});
