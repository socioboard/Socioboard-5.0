import { createFileRoute } from '@tanstack/react-router';

import { PostDetailPage } from '../features/posts';

export const Route = createFileRoute('/w/$slug/posts/$postId')({
  component: function Post() {
    const { postId } = Route.useParams();
    // A fresh page per post, so nothing (an open history, a dialog) carries over to the next.
    return <PostDetailPage key={postId} postId={postId} />;
  },
});
