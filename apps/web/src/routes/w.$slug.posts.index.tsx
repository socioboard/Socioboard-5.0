import { createFileRoute } from '@tanstack/react-router';

import { isPostTab, PostsPage, type PostsSearch } from '../features/posts';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/posts/')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): PostsSearch => ({
    tab: isPostTab(search.tab) && search.tab !== 'all' ? search.tab : undefined,
    label: stringParam(search.label, 64),
  }),
  component: function Posts() {
    const navigate = Route.useNavigate();
    return (
      <PostsPage
        search={Route.useSearch()}
        onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })}
      />
    );
  },
});
