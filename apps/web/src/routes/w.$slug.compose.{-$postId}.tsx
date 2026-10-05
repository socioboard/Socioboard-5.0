import { createFileRoute, redirect } from '@tanstack/react-router';
import { IsoDateTime } from '@socioboard/contracts';

import { ComposerPage } from '../features/composer';
import { canInWorkspace } from '../lib/route-guards';

// `/w/:slug/compose` (new post) and `/w/:slug/compose/:postId` (edit) are one route, so saving a
// new post can put its id in the address without leaving the page (docs/frontend/areas/composer.md).
export const Route = createFileRoute('/w/$slug/compose/{-$postId}')({
  validateSearch: (search): { at?: string | undefined } => {
    const at = IsoDateTime.safeParse(search.at);
    return { at: at.success ? at.data : undefined };
  },
  // Viewers can't write posts (the API refuses them too). Authors edit their own posts;
  // approvers edit anyone's; the page says which applies.
  beforeLoad: async ({ context, params }) => {
    if (!(await canInWorkspace(context.queryClient, params.slug, 'posts:create'))) {
      throw redirect({ to: '/w/$slug/calendar', params: { slug: params.slug }, replace: true });
    }
  },
  component: function Compose() {
    const { postId } = Route.useParams();
    return <ComposerPage postId={postId} initialAt={Route.useSearch().at} />;
  },
});
