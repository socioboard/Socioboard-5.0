import { apiRoutes, type AccountGroup, type SocialAccount } from '@socioboard/contracts';
import {
  AccountPicker,
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FormField,
  Input,
  NetworkIcon,
  Skeleton,
  staggerStyle,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { accountGroupsQuery, accountKeys, toPickerAccount } from '../api';

/** How many avatars a group card shows before "+N". */
const SHOWN = 6;

/**
 * The Accounts page's Groups tab (P3-F3, docs/frontend/areas/accounts.md): saved sets of
 * accounts the composer picks at once. Everyone sees them; account managers create, edit and
 * delete them.
 */
export function GroupsTab({
  accounts,
  canManage,
}: {
  accounts: SocialAccount[];
  canManage: boolean;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const groups = useQuery(accountGroupsQuery(workspace.id));
  // The group being edited, `null` for a new one; closed when undefined.
  const [editing, setEditing] = useState<AccountGroup | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AccountGroup | null>(null);
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: accountKeys.groups(workspace.id) });

  let body;
  if (groups.isPending) {
    body = (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="rounded-pane h-28" />
        <Skeleton className="rounded-pane h-28" />
      </div>
    );
  } else if (groups.isError) {
    body = (
      <EmptyState
        title={t('groups.loadError')}
        action={<Button onClick={() => void groups.refetch()}>{t('retry')}</Button>}
      />
    );
  } else if (groups.data.length === 0) {
    body = (
      <EmptyState
        icon={<Layers aria-hidden="true" />}
        title={t('groups.empty.title')}
        description={canManage ? t('groups.empty.body') : t('groups.empty.readOnlyBody')}
        {...(canManage && accounts.length > 0
          ? {
              action: (
                <Button
                  onClick={() => {
                    setEditing(null);
                  }}
                >
                  <Plus aria-hidden="true" />
                  {t('groups.new')}
                </Button>
              ),
            }
          : {})}
      />
    );
  } else {
    body = (
      <ul className="stagger-children grid gap-3 sm:grid-cols-2" aria-label={t('groups.title')}>
        {groups.data.map((g, i) => (
          <li key={g.id} style={staggerStyle(i)}>
            <GroupCard
              group={g}
              accounts={accounts}
              canManage={canManage}
              onEdit={() => {
                setEditing(g);
              }}
              onDelete={() => {
                setDeleting(g);
              }}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-2 max-w-prose text-sm">{t('groups.intro')}</p>
        {canManage && accounts.length > 0 && (groups.data?.length ?? 0) > 0 && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
            }}
          >
            <Plus aria-hidden="true" />
            {t('groups.new')}
          </Button>
        )}
      </div>
      {body}
      {canManage && (
        <GroupDialog
          group={editing}
          accounts={accounts}
          onClose={() => {
            setEditing(undefined);
          }}
          onSaved={() => void refresh()}
        />
      )}
      {canManage && (
        <ConfirmDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          tone="danger"
          title={t('groups.delete.title', { name: deleting?.name ?? '' })}
          description={t('groups.delete.body')}
          confirmLabel={t('groups.delete.confirm')}
          cancelLabel={t('cancel')}
          errorMessage={errorMessage}
          onConfirm={async () => {
            if (!deleting) return;
            await api(apiRoutes.socialAccounts.deleteAccountGroup, {
              params: { workspaceId: workspace.id, groupId: deleting.id },
            });
            setDeleting(null);
            toast.success(t('groups.delete.done', { name: deleting.name }));
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function GroupCard({
  group,
  accounts,
  canManage,
  onEdit,
  onDelete,
}: {
  group: AccountGroup;
  accounts: SocialAccount[];
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation('accounts');
  const members = group.accountIds.flatMap((id) => accounts.filter((a) => a.id === id));
  const cantPost = members.filter((a) => a.status !== 'active').length;
  return (
    <Card className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-ink truncate text-sm font-semibold">{group.name}</h3>
          <p className="text-ink-3 text-xs">
            {t('count', { count: members.length })}
            {cantPost > 0 && (
              <span className="text-warning"> · {t('groups.cantPost', { count: cantPost })}</span>
            )}
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('groups.edit', { name: group.name })}
              onClick={onEdit}
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('groups.delete.label', { name: group.name })}
              onClick={onDelete}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
      <ul
        className="flex flex-wrap items-center gap-1.5"
        aria-label={t('groups.members', { name: group.name })}
      >
        {members.slice(0, SHOWN).map((a) => (
          <li
            key={a.id}
            title={a.displayName}
            className={a.status === 'active' ? 'relative' : 'relative opacity-50'}
          >
            <Avatar name={a.displayName} src={a.avatarUrl} size="md" />
            <NetworkIcon
              network={a.network}
              variant="tile"
              size="xs"
              decorative
              className="absolute -right-1 -bottom-1"
            />
          </li>
        ))}
        {members.length > SHOWN && (
          <li className="text-ink-2 text-xs font-medium">
            {t('groups.more', { count: members.length - SHOWN })}
          </li>
        )}
      </ul>
    </Card>
  );
}

/** Create (`group: null`) or edit a group: its name and accounts, saved together. */
function GroupDialog({
  group,
  accounts,
  onClose,
  onSaved,
}: {
  group: AccountGroup | null | undefined;
  accounts: SocialAccount[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation('accounts');
  return (
    <Dialog
      open={group !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-xl" closeLabel={t('cancel')}>
        {/* Mounted only while open: each opening starts from the group as saved. */}
        {group !== undefined && (
          <GroupForm group={group} accounts={accounts} onClose={onClose} onSaved={onSaved} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GroupForm({
  group,
  accounts,
  onClose,
  onSaved,
}: {
  group: AccountGroup | null;
  accounts: SocialAccount[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const [name, setName] = useState(group?.name ?? '');
  // Only accounts still here: one removed for good can't be saved back.
  const [accountIds, setAccountIds] = useState(
    (group?.accountIds ?? []).filter((id) => accounts.some((a) => a.id === id)),
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; accounts?: string }>({});

  const submit = async () => {
    const next = {
      ...(name.trim() === '' ? { name: t('groups.form.nameRequired') } : {}),
      ...(accountIds.length === 0 ? { accounts: t('groups.form.accountsRequired') } : {}),
    };
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    try {
      const body = { name: name.trim(), accountIds };
      if (group) {
        await api(apiRoutes.socialAccounts.updateAccountGroup, {
          params: { workspaceId: workspace.id, groupId: group.id },
          body,
        });
      } else {
        await api(apiRoutes.socialAccounts.createAccountGroup, {
          params: { workspaceId: workspace.id },
          body,
        });
      }
      toast.success(t(group ? 'groups.form.updated' : 'groups.form.created', { name: body.name }));
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'GROUP_EXISTS') {
        setErrors({ name: t('groups.form.exists', { name: name.trim() }) });
      } else {
        toast.error(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <DialogHeader>
        <DialogTitle>{group ? t('groups.form.editTitle') : t('groups.form.newTitle')}</DialogTitle>
        <DialogDescription>{t('groups.form.description')}</DialogDescription>
      </DialogHeader>
      <FormField label={t('groups.form.name')} error={errors.name} required>
        {(p) => (
          <Input
            {...p}
            value={name}
            maxLength={60}
            placeholder={t('groups.form.namePlaceholder')}
            onChange={(e) => {
              setName(e.target.value);
            }}
            autoFocus
          />
        )}
      </FormField>
      <div className="flex flex-col gap-2">
        <span className="text-ink text-sm font-medium">
          {t('groups.form.accounts', { count: accountIds.length })}
        </span>
        <AccountPicker
          accounts={accounts.map(toPickerAccount)}
          value={accountIds}
          onChange={setAccountIds}
          labels={{ group: t('groups.form.accountsLabel') }}
        />
        {errors.accounts && (
          <p role="alert" className="text-danger text-xs">
            {errors.accounts}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={saving}>
          {group ? t('groups.form.save') : t('groups.form.create')}
        </Button>
      </DialogFooter>
    </form>
  );
}
