import { createFileRoute } from '@tanstack/react-router';

import { SignInScreen } from '../features/auth';
import { redirectIfSignedIn, redirectSearch, stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/login')({
  validateSearch: (search): { redirect?: string | undefined; error?: string | undefined } => ({
    ...redirectSearch(search),
    error: stringParam(search.error, 100),
  }),
  beforeLoad: ({ context, search }) => redirectIfSignedIn(context.queryClient, search.redirect),
  component: function Login() {
    const { redirect, error } = Route.useSearch();
    return (
      <SignInScreen {...(redirect ? { redirect } : {})} {...(error ? { linkError: error } : {})} />
    );
  },
});
