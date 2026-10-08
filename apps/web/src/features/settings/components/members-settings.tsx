import { apiRoutes, AssignableRole, type Member } from '@socioboard/contracts';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
  type Column,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { membersQuery, workspaceKeys } from '../api';
import { leaveWorkspaceView } from '../leave';
import { AccountAccessDialog } from './account-access-dialog';
import { InvitationsSection } from './invitations-section';
import { InviteDialog } from './invite-dialog';
import { SettingsSection } from './settings-page';

/** Owners and admins manage the accounts, so they always have every one (P4-B4). */
const hasAllAccounts = (m: Member) => m.role === 'owner' || m.role === 'admin';

interface Pending {
  kind: 'remove' | 'leave';
  member: Member;
}

/** `/w/:slug/settings/members`: everyone sees who is here; admins invite and manage roles. */
export function MembersSettings() {
  const { t } = useTranslation('settings');
  const { me, workspace } = useWorkspace();
  const can = useCan();
  const canManage = can('members:manage');
  const queryClient = useQueryClient();
  const members = useQuery(membersQuery(workspace.id));
  const [inviting, setInviting] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [limiting, setLimiting] = useState<Member | null>(null);

  const changeRole = async (member: Member, role: AssignableRole) => {
    setSavingRole(member.id);
    try {
      const updated = await api(apiRoutes.workspaces.updateMember, {
        params: { workspaceId: workspace.id, memberId: member.id },
        body: { role },
      });
      queryClient.setQueryData(workspaceKeys.members(workspace.id), (list?: Member[]) =>
        list?.map((m) => (m.id === updated.id ? updated : m)),
      );
      toast.success(t('members.roleChanged', { name: member.user.name, role: t(`roles.${role}`) }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingRole(null);
    }
  };

  const columns: Column<Member>[] = [
    {
      id: 'member',
      header: t('members.member'),
      cell: (m) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={m.user.name} src={m.user.avatarUrl} decorative />
          <div className="flex min-w-0 flex-col">
            <span className="text-ink flex min-w-0 items-center gap-2 text-sm font-medium">
              <span className="truncate">{m.user.name}</span>
              {m.user.id === me.user.id && (
                <Badge tone="outline" className="shrink-0">
                  {t('members.you')}
                </Badge>
              )}
            </span>
            <span className="text-ink-3 truncate text-xs">{m.user.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: t('members.role'),
      // Narrow on phones, so the member's name and email keep most of the row.
      className: 'w-28 @xl:w-44',
      cell: (m) => (
        <div className="flex flex-col items-start gap-0.5">
          {
            // Admins manage everyone except the owner and themselves (no locking yourself out).
            canManage && m.role !== 'owner' && m.user.id !== me.user.id ? (
              <Select
                value={m.role}
                disabled={savingRole === m.id}
                onValueChange={(role) => {
                  void changeRole(m, AssignableRole.parse(role));
                }}
              >
                <SelectTrigger
                  aria-label={t('members.roleOf', { name: m.user.name })}
                  className="h-8 w-full max-w-36"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AssignableRole.options.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-ink-2 text-sm">{t(`roles.${m.role}`)}</span>
            )
          }
          <AccessSummary
            member={m}
            canManage={canManage}
            onEdit={() => {
              setLimiting(m);
            }}
          />
        </div>
      ),
    },
    {
      id: 'joined',
      header: t('members.joined'),
      className: 'hidden w-32 @xl:table-cell',
      cell: (m) => (
        <span className="text-ink-3 text-sm whitespace-nowrap">{formatDate(m.joinedAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">{t('members.actions')}</span>,
      className: 'w-[4.5rem] text-right @xl:w-24',
      cell: (m) => {
        if (m.role === 'owner') return null;
        if (m.user.id === me.user.id) {
          return (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setPending({ kind: 'leave', member: m });
              }}
            >
              {t('members.leave')}
            </Button>
          );
        }
        if (!canManage) return null;
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPending({ kind: 'remove', member: m });
            }}
          >
            {t('members.remove')}
          </Button>
        );
      },
    },
  ];

  const rows = members.data ?? [];
  return (
    <>
      <SettingsSection
        title={t('members.title')}
        description={members.data ? t('members.count', { count: rows.length }) : undefined}
      >
        {canManage && (
          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setInviting(true);
              }}
            >
              <UserPlus aria-hidden="true" />
              {t('members.invite')}
            </Button>
          </div>
        )}
        <DataTable
          caption={t('members.title')}
          columns={columns}
          rows={rows}
          getRowId={(m) => m.id}
          loading={members.isPending}
          {...(members.isError
            ? { error: t('members.loadError'), onRetry: () => void members.refetch() }
            : {})}
          labels={{ retry: t('common.retry'), loading: t('members.title') }}
        />
      </SettingsSection>
      {canManage && <InvitationsSection />}
      {canManage && <InviteDialog open={inviting} onOpenChange={setInviting} />}
      {canManage && (
        <AccountAccessDialog
          member={limiting}
          onClose={() => {
            setLimiting(null);
          }}
        />
      )}
      <MemberDialog
        pending={pending}
        onClose={() => {
          setPending(null);
        }}
      />
    </>
  );
}

function MemberDialog({ pending, onClose }: { pending: Pending | null; onClose: () => void }) {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const member = pending?.member;
  const leaving = pending?.kind === 'leave';
  return (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      tone="danger"
      title={
        leaving
          ? t('members.leaveTitle', { workspace: workspace.name })
          : t('members.removeTitle', { name: member?.user.name ?? '' })
      }
      description={
        leaving
          ? t('members.leaveDescription')
          : t('members.removeDescription', { workspace: workspace.name })
      }
      confirmLabel={leaving ? t('members.leaveConfirm') : t('members.removeConfirm')}
      cancelLabel={t('common.cancel')}
      closeLabel={t('common.close')}
      errorMessage={errorMessage}
      onConfirm={async () => {
        if (!member) return;
        await api(apiRoutes.workspaces.removeMember, {
          params: { workspaceId: workspace.id, memberId: member.id },
        });
        if (leaving) {
          toast.success(t('members.left', { workspace: workspace.name }));
          await leaveWorkspaceView(queryClient, navigate, workspace.id);
          return;
        }
        queryClient.setQueryData(workspaceKeys.members(workspace.id), (list?: Member[]) =>
          list?.filter((m) => m.id !== member.id),
        );
        toast.success(t('members.removed', { name: member.user.name }));
      }}
    />
  );
}

/**
 * Which accounts a member can use, under their role (P4-F5): a button opening the access dialog
 * for people who manage members, plain text otherwise. A line rather than a column, so names
 * and emails keep their room in the settings page's width.
 */
function AccessSummary({
  member,
  canManage,
  onEdit,
}: {
  member: Member;
  canManage: boolean;
  onEdit: () => void;
}) {
  const { t } = useTranslation('settings');
  const all = hasAllAccounts(member) || member.accountIds === null;
  const label = all
    ? t('members.allAccounts')
    : member.accountIds?.length === 0
      ? t('members.noAccounts')
      : t('members.someAccounts', { count: member.accountIds?.length ?? 0 });
  if (canManage && !hasAllAccounts(member)) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-ink-3 hover:text-ink -ml-1.5 h-6 px-1.5 text-xs"
        aria-label={`${t('members.accountsOf', { name: member.user.name })}: ${label}`}
        onClick={onEdit}
      >
        {label}
      </Button>
    );
  }
  return (
    <span
      className="text-ink-3 text-xs"
      {...(hasAllAccounts(member) ? { title: t('access.adminHint') } : {})}
    >
      {label}
    </span>
  );
}
