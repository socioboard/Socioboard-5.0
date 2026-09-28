import { apiRoutes, type WorkspaceWithRole } from '@socioboard/contracts';
import {
  Button,
  ConfirmDialog,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { membersQuery, workspaceKeys } from '../api';
import { leaveWorkspaceView } from '../leave';
import { SettingsSection } from './settings-page';

/** Owner only: hand the workspace to an admin, or delete it. */
export function DangerZone({ workspace }: { workspace: WorkspaceWithRole }) {
  const { t } = useTranslation('settings');
  const [dialog, setDialog] = useState<'transfer' | 'delete' | null>(null);
  const close = (open: boolean) => {
    if (!open) setDialog(null);
  };
  return (
    <SettingsSection title={t('danger.title')} description={t('danger.body')} tone="danger">
      <Row
        title={t('danger.transfer')}
        body={t('danger.transferBody')}
        action={
          <Button
            size="sm"
            onClick={() => {
              setDialog('transfer');
            }}
          >
            {t('danger.transferAction')}
          </Button>
        }
      />
      <Row
        title={t('danger.delete')}
        body={t('danger.deleteBody')}
        action={
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setDialog('delete');
            }}
          >
            {t('danger.deleteAction')}
          </Button>
        }
      />
      <TransferDialog workspace={workspace} open={dialog === 'transfer'} onOpenChange={close} />
      <DeleteDialog workspace={workspace} open={dialog === 'delete'} onOpenChange={close} />
    </SettingsSection>
  );
}

function Row({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-48 flex-1 flex-col gap-0.5">
        <span className="text-ink text-sm font-medium">{title}</span>
        <span className="text-ink-3 text-[13px]">{body}</span>
      </div>
      {action}
    </div>
  );
}

function TransferDialog({
  workspace,
  open,
  onOpenChange,
}: {
  workspace: WorkspaceWithRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const selectId = useId();
  const members = useQuery({ ...membersQuery(workspace.id), enabled: open });
  const admins = (members.data ?? []).filter((m) => m.role === 'admin');
  const [memberId, setMemberId] = useState<string>();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('danger.transferTitle', { workspace: workspace.name })}
      description={t('danger.transferDescription')}
      confirmLabel={t('danger.transferConfirm')}
      cancelLabel={t('common.cancel')}
      closeLabel={t('common.close')}
      errorMessage={errorMessage}
      onConfirm={async () => {
        const target = admins.find((m) => m.id === memberId);
        if (!target) throw new ApiError(400, 'TARGET_NOT_ADMIN', '', undefined);
        await api(apiRoutes.workspaces.transferOwnership, {
          params: { workspaceId: workspace.id },
          body: { memberId: target.id },
        });
        // My role changed: every view of this workspace and `me` needs the new answer.
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspace.id) }),
          queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
        ]);
        toast.success(t('danger.transferred', { name: target.user.name }));
      }}
    >
      {admins.length === 0 && !members.isPending ? (
        <p className="text-ink-2 text-sm">{t('danger.transferNone')}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={selectId}>{t('danger.transferTo')}</Label>
          <Select value={memberId ?? ''} onValueChange={setMemberId}>
            <SelectTrigger id={selectId}>
              <SelectValue placeholder={t('danger.transferPick')} />
            </SelectTrigger>
            <SelectContent>
              {admins.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.user.name} · {m.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </ConfirmDialog>
  );
}

function DeleteDialog({
  workspace,
  open,
  onOpenChange,
}: {
  workspace: WorkspaceWithRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      title={t('danger.deleteTitle', { workspace: workspace.name })}
      description={t('danger.deleteDescription')}
      confirmLabel={t('danger.deleteConfirm')}
      cancelLabel={t('common.cancel')}
      closeLabel={t('common.close')}
      typeToConfirm={{
        value: workspace.name,
        label: t('danger.deleteType', { workspace: workspace.name }),
      }}
      errorMessage={errorMessage}
      onConfirm={async () => {
        await api(apiRoutes.workspaces.deleteWorkspace, {
          params: { workspaceId: workspace.id },
          body: { confirmName: workspace.name },
        });
        toast.success(t('danger.deleted', { workspace: workspace.name }));
        await leaveWorkspaceView(queryClient, navigate, workspace.id);
      }}
    />
  );
}
