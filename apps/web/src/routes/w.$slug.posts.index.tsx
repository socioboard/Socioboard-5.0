import { createFileRoute } from '@tanstack/react-router';

import { isPostTab, PostsPage, type PostsSearch } from '../features/posts';

export const Route = createFileRoute('/w/$slug/posts/')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): PostsSearch => ({
    tab: isPostTab(search.tab) && search.tab !== 'all' ? search.tab : undefined,
  }),
  component: function Posts() {
    return <PostsPage search={Route.useSearch()} />;
  },
});
