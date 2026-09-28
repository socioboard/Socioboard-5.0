// Placeholder workspace home; P0-F5 replaces it with the app shell (calendar first).
import { Button } from '@socioboard/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { AuthLayout, useSignOut } from '../features/auth';
import { requireSignedIn } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug')({
  beforeLoad: ({ context, params }) =>
    requireSignedIn(context.queryClient, `/w/${encodeURIComponent(params.slug)}`),
  component: function Workspace() {
    const { t } = useTranslation('auth');
    const { slug } = Route.useParams();
    const signOut = useSignOut();
    return (
      <AuthLayout
        title={t('placeholder.workspaceTitle', { slug })}
        subtitle={t('placeholder.workspaceBody')}
      >
        <Button
          onClick={() => {
            void signOut();
          }}
        >
          {t('invite.signOut')}
        </Button>
      </AuthLayout>
    );
  },
});
