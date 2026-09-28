import { createFileRoute } from '@tanstack/react-router';

import { VerifyEmailScreen } from '../features/auth';
import { redirectSearch, stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (
    search,
  ): {
    redirect?: string | undefined;
    error?: string | undefined;
  } => ({
    ...redirectSearch(search),
    error: stringParam(search.error, 100),
  }),
  component: function VerifyEmail() {
    const { redirect, error } = Route.useSearch();
    return (
      <VerifyEmailScreen
        {...(redirect ? { redirect } : {})}
        {...(error ? { linkError: error } : {})}
      />
    );
  },
});
