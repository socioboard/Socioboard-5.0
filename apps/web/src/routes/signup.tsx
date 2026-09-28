import { createFileRoute } from '@tanstack/react-router';

import { SignUpScreen } from '../features/auth';
import { redirectIfSignedIn, redirectSearch } from '../lib/route-guards';

export const Route = createFileRoute('/signup')({
  validateSearch: redirectSearch,
  beforeLoad: ({ context, search }) => redirectIfSignedIn(context.queryClient, search.redirect),
  component: function SignUp() {
    const { redirect } = Route.useSearch();
    return <SignUpScreen {...(redirect ? { redirect } : {})} />;
  },
});
