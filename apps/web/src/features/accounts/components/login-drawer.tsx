import { apiRoutes, type SocialConnection } from '@socioboard/contracts';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  DrawerContent,
  DrawerTitle,
  NetworkIcon,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { connectionsQuery, refreshAccounts, startReconnect } from '../api';

/** One login (`?login=<id>`): its accounts, adding more from it, reconnecting or removing it. */
export function LoginDrawer({
  connectionId,
  onClose,
  onOpenAccount,
}: {
  connectionId: string | undefined;
  onClose: () => void;
  onOpenAccount: (accountId: string) => void;
}) {
  const { t } = useTranslation('accounts');
  return (
    <Drawer
      open={connectionId !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent closeLabel={t('details.close')} aria-describedby={undefined}>
        {connectionId && (
          <Details connectionId={connectionId} onClose={onClose} onOpenAccount={onOpenAccount} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Details({
  connectionId,
  onClose,
  onOpenAccount,
}: {
  connectionId: string;
  onClose: () => void;
  onOpenAccount: (accountId: string) => void;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const connections = useQuery(connectionsQuery(workspace.id));

  if (connections.isPending) {
    return (
      <>
        <DrawerTitle className="sr-only">{t('loginDetails.title', { provider: '' })}</DrawerTitle>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-32 w-full" />
      </>
    );
  }
  const connection = connections.data?.find((c) => c.id === connectionId);
  if (!connection) {
    return (
      <>
        <DrawerTitle>{t('loginDetails.title', { provider: '' })}</DrawerTitle>
        <FormError>
          {connections.isError ? errorMessage(connections.error) : t('loginDetails.notFound')}
        </FormError>
      </>
    );
  }
  return <Loaded connection={connection} onClose={onClose} onOpenAccount={onOpenAccount} />;
}

function Loaded({
  connection,
  onClose,
  onOpenAccount,
}: {
  connection: SocialConnection;
  onClose: () => void;
  onOpenAccount: (accountId: string) => void;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const provider = t(`providers.${connection.provider}`);
  const count = connection.accounts.length;

  const reconnect = async () => {
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
        <Avatar name={connection.displayName} src={connection.avatarUrl} size="xl" decorative />
        <div className="flex min-w-0 flex-col gap-1">
          <DrawerTitle className="break-words">{connection.displayName}</DrawerTitle>
          <span className="text-ink-3 flex flex-wrap items-center gap-2 text-sm">
            {t('loginDetails.title', { provider })}
            {connection.status !== 'active' && (
              <Badge tone="danger" dot>
                {t(`status.${connection.status}`)}
              </Badge>
            )}
          </span>
          {connection.connectedBy && (
            <span className="text-ink-3 text-xs">
              {t('account.connectedBy', {
                name: connection.connectedBy.name,
                date: formatDate(connection.createdAt),
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-ink-2 text-xs font-semibold">{t('loginDetails.accounts')}</h3>
        {count === 0 ? (
          <p className="text-ink-3 text-sm">{t('login.nothingAdded')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {connection.accounts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAccount(a.id);
                  }}
                  className="hover:bg-chip focus-visible:ring-selected rounded-control flex w-full items-center gap-2.5 px-2 py-1.5 text-left outline-none"
                >
                  <NetworkIcon network={a.network} size="sm" />
                  <span className="text-ink min-w-0 flex-1 truncate text-sm">{a.displayName}</span>
                  {a.status !== 'active' && (
                    <Badge tone={a.status === 'paused' ? 'warning' : 'danger'}>
                      {t(`status.${a.status}`)}
                    </Badge>
                  )}
                  <ChevronRight className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button asChild>
          <Link
            to="/w/$slug/accounts/connect/$provider"
            params={{ slug: workspace.slug, provider: connection.provider }}
            search={{ connection: connection.id }}
          >
            <Plus aria-hidden="true" />
            {t('loginDetails.addMore')}
          </Link>
        </Button>
        <Button
          variant={connection.status === 'active' ? 'secondary' : 'primary'}
          disabled={reconnecting}
          onClick={() => void reconnect()}
        >
          <RefreshCw aria-hidden="true" />
          {t('loginDetails.reconnect')}
        </Button>
        <Button
          variant="ghost"
          className="text-danger"
          onClick={() => {
            setConfirming(true);
          }}
        >
          <Trash2 aria-hidden="true" />
          {t('loginDetails.remove')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={t('loginDetails.removeTitle', { name: connection.displayName, provider })}
        description={
          <>
            {count === 0
              ? t('loginDetails.removeBodyNone')
              : t('loginDetails.removeBody', { count })}{' '}
            {t('loginDetails.removeHistory')}
          </>
        }
        confirmLabel={t('loginDetails.removeConfirm')}
        cancelLabel={t('cancel')}
        closeLabel={t('details.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          await api(apiRoutes.socialAccounts.removeConnection, {
            params: { workspaceId: workspace.id, connectionId: connection.id },
          });
          toast.success(t('loginDetails.removed', { name: connection.displayName }));
          onClose();
          await refreshAccounts(queryClient, workspace.id);
        }}
      />
    </>
  );
}
