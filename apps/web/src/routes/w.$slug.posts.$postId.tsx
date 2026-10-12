import { createFileRoute } from '@tanstack/react-router';

import { PostDetailPage } from '../features/posts';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/posts/$postId')({
  // `comment`: a comment to bring into view, from a notification's link.
  validateSearch: (search): { comment?: string | undefined } => ({
    comment: stringParam(search.comment, 64),
  }),
  component: function Post() {
    const { postId } = Route.useParams();
    const { comment } = Route.useSearch();
    // A fresh page per post, so nothing (an open history, a dialog) carries over to the next.
    return <PostDetailPage key={postId} postId={postId} commentId={comment} />;
  },
});
