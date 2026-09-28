import { apiRoutes, type InvitationPreview } from '@socioboard/contracts';
import { Avatar, Button, Skeleton } from '@socioboard/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { useSignOut } from '../hooks';
import { AuthLayout, FormError, FormNotice } from './auth-layout';

/** Accept or decline a workspace invitation; signed-out visitors sign in or up first. */
export function InvitationScreen({ invitationId }: { invitationId: string }) {
  const { t } = useTranslation('auth');
  const here = `/invite/${invitationId}`;
  const preview = useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: ({ signal }) =>
      api(apiRoutes.workspaces.getInvitation, { params: { invitationId }, signal }),
    retry: false,
  });
  const me = useQuery(meQuery);

  if (preview.isPending || me.isPending) {
    return (
      <AuthLayout title={<Skeleton className="h-7 w-48" />}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-11 w-full" />
      </AuthLayout>
    );
  }

  if (preview.isError) {
    const notFound = preview.error instanceof ApiError && preview.error.status === 404;
    return (
      <AuthLayout title={t('invite.title', { workspace: 'Socioboard' })}>
        <FormError>{notFound ? t('invite.notFound') : errorMessage(preview.error)}</FormError>
      </AuthLayout>
    );
  }

  const invitation = preview.data;
  const heading = t('invite.title', { workspace: invitation.workspace.name });
  if (invitation.status !== 'pending') {
    const message = {
      expired: t('invite.expired', { inviter: invitation.invitedByName }),
      accepted: t('invite.accepted'),
      revoked: t('invite.revoked'),
      declined: t('invite.declinedStatus'),
    }[invitation.status];
    return (
      <AuthLayout title={heading}>
        <FormError>{message}</FormError>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={heading}
      subtitle={t('invite.body', {
        inviter: invitation.invitedByName,
        role: t(`roles.${invitation.role}`),
      })}
    >
      <div className="glass-chip rounded-control flex items-center gap-3 p-3">
        <Avatar name={invitation.workspace.name} src={invitation.workspace.logoUrl} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{invitation.workspace.name}</span>
          <span className="text-ink-3 text-xs">
            {t('invite.sentTo', { email: invitation.emailHint })}
          </span>
        </div>
      </div>
      {me.data ? (
        <Respond invitation={invitation} email={me.data.user.email} here={here} />
      ) : (
        <div className="flex flex-col gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to="/login" search={{ redirect: here }}>
              {t('invite.signInToAccept')}
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/signup" search={{ redirect: here }}>
              {t('invite.createAccount')}
            </Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

function Respond({
  invitation,
  email,
  here,
}: {
  invitation: InvitationPreview;
  email: string;
  here: string;
}) {
  const { t } = useTranslation('auth');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [declined, setDeclined] = useState(false);
  const params = { invitationId: invitation.id };

  const accept = useMutation({
    mutationFn: () => api(apiRoutes.workspaces.acceptInvitation, { params }),
    onSuccess: async (workspace) => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      await navigate({ href: `/w/${encodeURIComponent(workspace.slug)}`, replace: true });
    },
  });
  const decline = useMutation({
    mutationFn: () => api(apiRoutes.workspaces.declineInvitation, { params }),
    onSuccess: () => {
      setDeclined(true);
    },
  });

  if (declined) {
    return (
      <FormNotice>{t('invite.declined', { workspace: invitation.workspace.name })}</FormNotice>
    );
  }

  const error = accept.error ?? decline.error;
  const code = error instanceof ApiError ? error.code : undefined;
  // The API answers "not found" for an invitation addressed to someone else, so it never confirms
  // the invitation to the wrong person; the preview already proved it exists, so say what to do.
  if (code === 'INVITATION_NOT_FOUND') {
    return (
      <div className="flex flex-col gap-3">
        <FormError>{t('invite.wrongAccount', { hint: invitation.emailHint, email })}</FormError>
        <Button
          size="lg"
          onClick={() => {
            void signOut(`/login?redirect=${encodeURIComponent(here)}`);
          }}
        >
          {t('invite.signOut')}
        </Button>
      </div>
    );
  }
  if (code === 'EMAIL_NOT_VERIFIED') {
    return (
      <div className="flex flex-col gap-3">
        <FormError>{t('invite.verifyFirst')}</FormError>
        <Button asChild variant="primary" size="lg">
          <Link to="/verify-email" search={{ redirect: here }}>
            {t('invite.goVerify')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-3 text-xs">{t('invite.signedInAs', { email })}</p>
      <FormError>{error ? errorMessage(error) : undefined}</FormError>
      <Button
        variant="primary"
        size="lg"
        loading={accept.isPending}
        disabled={decline.isPending}
        onClick={() => {
          accept.mutate();
        }}
      >
        {t('invite.accept')}
      </Button>
      <Button
        variant="ghost"
        loading={decline.isPending}
        disabled={accept.isPending}
        onClick={() => {
          decline.mutate();
        }}
      >
        {t('invite.decline')}
      </Button>
    </div>
  );
}
