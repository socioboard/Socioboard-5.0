import { createFileRoute } from '@tanstack/react-router';

import { ResetPasswordScreen } from '../features/auth';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search): { token?: string | undefined; error?: string | undefined } => ({
    token: stringParam(search.token, 200),
    error: stringParam(search.error, 100),
  }),
  component: function ResetPassword() {
    const { token, error } = Route.useSearch();
    return (
      <ResetPasswordScreen {...(token ? { token } : {})} {...(error ? { linkError: error } : {})} />
    );
  },
});
