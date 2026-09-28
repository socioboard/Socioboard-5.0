import { apiRoutes, type Invitation } from '@socioboard/contracts';
import { Button, ConfirmDialog, Skeleton, toast } from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { invitationsQuery, workspaceKeys } from '../api';
import { SettingsSection } from './settings-page';

/** Invitations not yet answered: copy the link (to send another way) or revoke it. */
export function InvitationsSection() {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const invitations = useQuery(invitationsQuery(workspace.id));
  const [revoking, setRevoking] = useState<Invitation | null>(null);
  const pending = (invitations.data ?? []).filter((i) => i.status === 'pending');

  const copyLink = async (invitation: Invitation) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.id}`);
      toast.success(t('invitations.copied'));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  let body;
  if (invitations.isPending) body = <Skeleton className="h-14 w-full" />;
  else if (invitations.isError) body = <FormError>{errorMessage(invitations.error)}</FormError>;
  else if (pending.length === 0) {
    body = <p className="text-ink-3 text-sm">{t('invitations.empty')}</p>;
  } else {
    body = (
      <ul className="divide-hair glass-chip rounded-control flex flex-col divide-y">
        {pending.map((invitation) => (
          <li key={invitation.id} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ink truncate text-sm font-medium">{invitation.email}</span>
              <span className="text-ink-3 text-xs">
                {t('invitations.invitedBy', {
                  role: t(`roles.${invitation.role}`),
                  name: invitation.invitedBy.name,
                  date: formatDate(invitation.expiresAt),
                })}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => void copyLink(invitation)}>
                <Link2 aria-hidden="true" />
                {t('invitations.copyLink')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRevoking(invitation);
                }}
              >
                {t('invitations.revoke')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SettingsSection title={t('invitations.title')}>
      {body}
      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => {
          if (!open) setRevoking(null);
        }}
        tone="danger"
        title={t('invitations.revokeTitle', { email: revoking?.email ?? '' })}
        description={t('invitations.revokeDescription')}
        confirmLabel={t('invitations.revokeConfirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          if (!revoking) return;
          await api(apiRoutes.workspaces.revokeInvitation, {
            params: { workspaceId: workspace.id, invitationId: revoking.id },
          });
          queryClient.setQueryData(workspaceKeys.invitations(workspace.id), (list?: Invitation[]) =>
            list?.filter((i) => i.id !== revoking.id),
          );
          toast.success(t('invitations.revoked'));
        }}
      />
    </SettingsSection>
  );
}
