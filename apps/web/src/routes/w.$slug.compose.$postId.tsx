import { createFileRoute, redirect } from '@tanstack/react-router';

import { ComposerPage } from '../features/composer';
import { canInWorkspace } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/compose/$postId')({
  // Authors edit their own posts; approvers edit anyone's. The page says which applies.
  beforeLoad: async ({ context, params }) => {
    if (!(await canInWorkspace(context.queryClient, params.slug, 'posts:create'))) {
      throw redirect({ to: '/w/$slug/calendar', params: { slug: params.slug }, replace: true });
    }
  },
  component: function EditPost() {
    const { postId } = Route.useParams();
    return <ComposerPage postId={postId} />;
  },
});
