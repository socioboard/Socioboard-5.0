import { apiRoutes, type SocialAccountDetails } from '@socioboard/contracts';
import {
  Avatar,
  Badge,
  Button,
  cn,
  ConfirmDialog,
  Drawer,
  DrawerContent,
  DrawerTitle,
  NetworkIcon,
  networkName,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, CircleCheck, RefreshCw, Unplug, Clock } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { formatDate, formatDateTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { accountDetailQuery, refreshAccounts, startReconnect } from '../api';
import { PostingTimesDialog } from './posting-times-dialog';

/** One account's health and the login it comes through (`?account=<id>`, so it can be linked). */
export function AccountDrawer({
  accountId,
  onClose,
}: {
  accountId: string | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation('accounts');
  return (
    <Drawer
      open={accountId !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent closeLabel={t('details.close')} aria-describedby={undefined}>
        {accountId && <Details accountId={accountId} onClose={onClose} />}
      </DrawerContent>
    </Drawer>
  );
}

function Details({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const detail = useQuery(accountDetailQuery(workspace.id, accountId));

  if (detail.isPending) {
    return (
      <>
        <DrawerTitle className="sr-only">{t('details.title')}</DrawerTitle>
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-24 w-full" />
      </>
    );
  }
  if (detail.isError) {
    return (
      <>
        <DrawerTitle>{t('details.title')}</DrawerTitle>
        <FormError>{errorMessage(detail.error)}</FormError>
      </>
    );
  }
  return <Loaded account={detail.data} onClose={onClose} />;
}

function Loaded({ account, onClose }: { account: SocialAccountDetails; onClose: () => void }) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [postingTimes, setPostingTimes] = useState(false);
  const healthy = account.status === 'active';
  // Paused is a choice (or a sample), not a fault: amber, like its badge.
  const paused = account.status === 'paused';
  const connection = account.connection;

  const reconnect = async () => {
    if (!connection) return;
    setReconnecting(true);
    try {
      await startReconnect(workspace.id, connection.id);
    } catch (err) {
      toast.error(errorMessage(err));
      setReconnecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 pr-10">
        <span className="relative shrink-0">
          <Avatar name={account.displayName} src={account.avatarUrl} size="xl" decorative />
          <NetworkIcon
            network={account.network}
            variant="tile"
            size="sm"
            decorative
            className="ring-canvas absolute -right-1 -bottom-1 ring-2"
          />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <DrawerTitle className="break-words">{account.displayName}</DrawerTitle>
          {account.username && (
            <span className="text-ink-3 truncate text-sm">@{account.username}</span>
          )}
        </div>
      </div>

      <div
        className={cn(
          'rounded-control flex items-start gap-2.5 p-3',
          healthy ? 'glass-chip' : paused ? 'bg-warning-tint' : 'bg-danger-tint',
        )}
      >
        {healthy ? (
          <CircleCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CircleAlert
            className={cn('mt-0.5 size-4 shrink-0', paused ? 'text-warning' : 'text-danger')}
            aria-hidden="true"
          />
        )}
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-ink font-medium">
            {healthy ? t('details.working') : t(`status.${account.status}`)}
          </span>
          {!healthy && account.statusReason && (
            <span className="text-ink-2 leading-relaxed">{account.statusReason}</span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
        <Row label={t('details.network')}>{networkName(account.network)}</Row>
        {connection && (
          <Row label={t('details.login')}>
            <span className="flex flex-wrap items-center gap-2">
              {connection.displayName}
              <span className="text-ink-3">
                {t('login.via', { provider: t(`providers.${connection.provider}`) })}
              </span>
              {connection.status !== 'active' && (
                <Badge tone="danger">{t(`status.${connection.status}`)}</Badge>
              )}
            </span>
          </Row>
        )}
        {account.connectedBy && (
          <Row label={t('details.connectedBy')}>{account.connectedBy.name}</Row>
        )}
        <Row label={t('details.connected')}>{formatDate(account.createdAt)}</Row>
        <Row label={t('details.lastChecked')}>
          {account.lastCheckedAt ? formatDateTime(account.lastCheckedAt) : t('details.never')}
        </Row>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2">
        {can('accounts:connect') && connection && (
          <Button
            variant={healthy ? 'secondary' : 'primary'}
            disabled={reconnecting}
            onClick={() => void reconnect()}
          >
            <RefreshCw aria-hidden="true" />
            {t('details.reconnect')}
          </Button>
        )}
        {can('accounts:manage') && account.status !== 'disconnected' && (
          <Button
            onClick={() => {
              setPostingTimes(true);
            }}
          >
            <Clock aria-hidden="true" />
            {t('details.postingTimes')}
          </Button>
        )}
        {can('accounts:manage') && (
          <Button
            variant="ghost"
            className="text-danger"
            onClick={() => {
              setConfirming(true);
            }}
          >
            <Unplug aria-hidden="true" />
            {t('details.disconnect')}
          </Button>
        )}
      </div>

      {can('accounts:manage') && (
        <PostingTimesDialog account={account} open={postingTimes} onOpenChange={setPostingTimes} />
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={t('details.disconnectTitle', { name: account.displayName })}
        description={
          <>
            {account.pendingPostCount > 0
              ? t('details.disconnectPending', { count: account.pendingPostCount })
              : t('details.disconnectNone')}{' '}
            {t('details.disconnectHistory')}
          </>
        }
        confirmLabel={t('details.disconnectConfirm')}
        cancelLabel={t('cancel')}
        closeLabel={t('details.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          await api(apiRoutes.socialAccounts.disconnectAccount, {
            params: { workspaceId: workspace.id, accountId: account.id },
          });
          toast.success(t('details.disconnected', { name: account.displayName }));
          onClose();
          await refreshAccounts(queryClient, workspace.id);
        }}
      />
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-ink min-w-0">{children}</dd>
    </>
  );
}
