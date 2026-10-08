import { apiRoutes, type Member } from '@socioboard/contracts';
import {
  AccountPicker,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioCard,
  RadioGroup,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, toPickerAccount } from '../../accounts';
import { workspaceKeys } from '../api';

/**
 * Which social accounts a member may use (P4-F5, docs/frontend/areas/workspace-settings.md):
 * every account, or only the ones picked. Owners and admins always have all, so it opens only
 * for the other roles.
 */
export function AccountAccessDialog({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('settings');
  return (
    <Dialog
      open={member !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-xl" closeLabel={t('common.close')}>
        {/* Mounted only while open: each opening starts from the access as saved. */}
        {member && <AccessForm member={member} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function AccessForm({ member, onClose }: { member: Member; onClose: () => void }) {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const accounts = useQuery(accountsQuery(workspace.id));
  const [mode, setMode] = useState<'all' | 'some'>(member.accountIds === null ? 'all' : 'some');
  const [picked, setPicked] = useState<string[]>(member.accountIds ?? []);
  const [saving, setSaving] = useState(false);

  // Only accounts still connected can be picked; one removed since drops out on saving.
  const live = accounts.data ?? [];
  const chosen = picked.filter((id) => live.some((a) => a.id === id));

  const save = async () => {
    setSaving(true);
    try {
      const accountIds = mode === 'all' ? null : chosen;
      const saved = await api(apiRoutes.workspaces.setMemberAccountAccess, {
        params: { workspaceId: workspace.id, memberId: member.id },
        body: { accountIds },
      });
      queryClient.setQueryData(workspaceKeys.members(workspace.id), (list?: Member[]) =>
        list?.map((m) => (m.id === member.id ? { ...m, accountIds: saved.accountIds } : m)),
      );
      toast.success(
        t('access.saved', {
          name: member.user.name,
          what:
            saved.accountIds === null
              ? t('access.savedAll')
              : t('access.savedSome', { count: saved.accountIds.length }),
        }),
      );
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <DialogHeader>
        <DialogTitle>{t('access.title', { name: member.user.name })}</DialogTitle>
        <DialogDescription>{t('access.description')}</DialogDescription>
      </DialogHeader>
      <RadioGroup
        value={mode}
        onValueChange={(v) => {
          setMode(v === 'some' ? 'some' : 'all');
        }}
        aria-label={t('access.title', { name: member.user.name })}
      >
        <RadioCard value="all" label={t('access.all')} description={t('access.allBody')} />
        <RadioCard value="some" label={t('access.some')} description={t('access.someBody')} />
      </RadioGroup>
      {mode === 'some' && (
        <div className="animate-fade-in flex flex-col gap-2">
          {accounts.isPending ? (
            <Skeleton className="rounded-pane h-24" />
          ) : live.length === 0 ? (
            <p className="text-ink-3 text-sm">{t('access.noAccounts')}</p>
          ) : (
            <>
              <span className="text-ink text-sm font-medium">
                {t('access.picked', { count: chosen.length })}
              </span>
              <AccountPicker
                accounts={live.map(toPickerAccount)}
                value={chosen}
                onChange={setPicked}
                labels={{ group: t('access.pickLabel') }}
              />
            </>
          )}
          {chosen.length === 0 && !accounts.isPending && (
            <p role="status" className="text-warning text-xs">
              {t('access.noneWarning')}
            </p>
          )}
        </div>
      )}
      <DialogFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={saving}>
          {t('access.save')}
        </Button>
      </DialogFooter>
    </form>
  );
}
