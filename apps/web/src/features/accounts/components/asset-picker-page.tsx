import {
  apiRoutes,
  type ConnectableAsset,
  type ConnectResult,
  type LoginProvider,
  type NetworkId,
} from '@socioboard/contracts';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Checkbox,
  EmptyState,
  NetworkIcon,
  networkName,
  PageHeader,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CircleAlert, RefreshCw, SearchX } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import {
  connectableAssetsQuery,
  networkDidNotAnswer,
  refreshAccounts,
  startConnect,
  startReconnect,
} from '../api';
import { connectErrorText } from '../errors';

export interface ConnectSearch {
  connection?: string | undefined;
  result?: ConnectResult | undefined;
  error?: string | undefined;
}

/**
 * `/w/:slug/accounts/connect/:provider`: where the network sends the browser back. Shows who
 * signed in, then what that login can post to, so the user ticks what to add
 * (docs/frontend/areas/accounts.md, "Flow: connect an account").
 */
export function AssetPickerPage({
  provider,
  search,
}: {
  provider: LoginProvider;
  search: ConnectSearch;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('picker.title')}
        leading={
          <Button asChild variant="ghost" size="icon" aria-label={t('picker.backToAccounts')}>
            <Link to="/w/$slug/accounts" params={{ slug: workspace.slug }}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6">
          {search.error || !search.connection ? (
            <ConnectFailed provider={provider} code={search.error ?? 'OAUTH_STATE_INVALID'} />
          ) : (
            <Picker provider={provider} connectionId={search.connection} result={search.result} />
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectFailed({ provider, code }: { provider: LoginProvider; code: string }) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const name = t(`providers.${provider}`);
  const retry = async () => {
    setStarting(true);
    setError(null);
    try {
      await startConnect(workspace.id, provider, false);
    } catch (err) {
      setError(err);
      setStarting(false);
    }
  };
  return (
    <EmptyState
      icon={<CircleAlert className="text-danger" />}
      title={t('connectError.title', { provider: name })}
      description={
        <>
          {connectErrorText(code)}
          {error !== null && (
            <span className="mt-3 block">
              <FormError>{errorMessage(error)}</FormError>
            </span>
          )}
        </>
      }
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {code !== 'NETWORK_NOT_ENABLED' && (
            <Button variant="primary" disabled={starting} onClick={() => void retry()}>
              {t('connectError.tryAgain')}
            </Button>
          )}
          <Button asChild>
            <Link to="/w/$slug/accounts" params={{ slug: workspace.slug }}>
              {t('picker.backToAccounts')}
            </Link>
          </Button>
        </div>
      }
    />
  );
}

/** Addable: not in the workspace yet, or held by another login (adding moves it here). */
const addable = (a: ConnectableAsset) =>
  a.unavailableReason === null && (a.account === null || a.connectedVia !== null);

function Picker({
  provider,
  connectionId,
  result,
}: {
  provider: LoginProvider;
  connectionId: string;
  result: ConnectResult | undefined;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const assets = useQuery(connectableAssetsQuery(workspace.id, connectionId));
  // Ticked by default: everything new. Moving one from another login is a choice, so it isn't.
  const [chosen, setChosen] = useState<Set<string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const name = t(`providers.${provider}`);

  if (assets.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="rounded-control h-11" />
        <Skeleton className="rounded-control h-16" />
        <Skeleton className="rounded-control h-16" />
      </div>
    );
  }
  if (assets.isError) {
    return <LoadFailed provider={provider} connectionId={connectionId} error={assets.error} />;
  }

  const { connection, items } = assets.data;
  const selected =
    chosen ??
    new Set(items.filter((a) => addable(a) && a.connectedVia === null).map((a) => a.externalId));
  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    setChosen(next);
  };
  const done = () => void navigate({ to: '/w/$slug/accounts', params: { slug: workspace.slug } });

  const add = async () => {
    setSaving(true);
    setError(null);
    try {
      const added = await api(apiRoutes.socialAccounts.addAssets, {
        params: { workspaceId: workspace.id, connectionId },
        body: { externalIds: [...selected] },
      });
      toast.success(t('picker.addedToast', { count: added.items.length }));
      await refreshAccounts(queryClient, workspace.id);
      done();
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const byNetwork = new Map<NetworkId, ConnectableAsset[]>();
  for (const a of items) byNetwork.set(a.network, [...(byNetwork.get(a.network) ?? []), a]);
  const anyAddable = items.some(addable);

  return (
    <>
      <ResultBanner
        result={result}
        name={connection.displayName}
        provider={name}
        avatarUrl={connection.avatarUrl}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title={t('picker.nothingTitle', { name: connection.displayName })}
          description={t('picker.nothingBody', { provider: name })}
          action={<Button onClick={done}>{t('picker.done')}</Button>}
        />
      ) : (
        <>
          <h2 className="text-ink text-[15px] font-semibold tracking-tight">
            {t('picker.choose')}
          </h2>
          {[...byNetwork].map(([network, list]) => (
            <fieldset key={network} className="flex flex-col gap-2">
              <legend className="text-ink-2 mb-2 flex items-center gap-2 text-xs font-semibold">
                <NetworkIcon network={network} size="xs" decorative />
                {networkName(network)}
              </legend>
              <ul className="flex flex-col gap-2">
                {list.map((a) => (
                  <li key={a.externalId}>
                    <AssetRow
                      asset={a}
                      checked={
                        a.account !== null && a.connectedVia === null
                          ? true
                          : selected.has(a.externalId)
                      }
                      onChange={(on) => {
                        toggle(a.externalId, on);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
          {!anyAddable && <p className="text-ink-2 text-sm">{t('picker.allAdded')}</p>}
          {error !== null && <FormError>{errorMessage(error)}</FormError>}
          <div className="border-hair flex flex-wrap items-center justify-end gap-2 border-t pt-4">
            {anyAddable ? (
              <>
                <Button variant="ghost" onClick={done}>
                  {t('picker.skip')}
                </Button>
                <Button
                  variant="primary"
                  disabled={selected.size === 0 || saving}
                  onClick={() => void add()}
                >
                  {t('picker.add', { count: selected.size })}
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={done}>
                {t('picker.done')}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ResultBanner({
  result,
  name,
  provider,
  avatarUrl,
}: {
  result: ConnectResult | undefined;
  name: string;
  provider: string;
  avatarUrl: string | null;
}) {
  const { t } = useTranslation('accounts');
  if (result === 'already_connected') {
    return <Banner tone="warning">{t('picker.alreadyConnected', { name, provider })}</Banner>;
  }
  return (
    <div className="glass-chip rounded-control flex items-center gap-3 px-3.5 py-2.5" role="status">
      <Avatar name={name} src={avatarUrl} size="md" decorative />
      <span className="text-ink-2 text-sm">
        {result === 'reconnected'
          ? t('picker.reconnected', { name, provider })
          : t('picker.signedInAs', { name, provider })}
      </span>
    </div>
  );
}

function AssetRow({
  asset,
  checked,
  onChange,
}: {
  asset: ConnectableAsset;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  const { t } = useTranslation('accounts');
  const alreadyHere = asset.account !== null && asset.connectedVia === null;
  const unavailable = asset.unavailableReason;
  const note = unavailable
    ? t(`picker.unavailable.${unavailable}`)
    : asset.connectedVia
      ? t('picker.movesHere', { name: asset.connectedVia.displayName })
      : undefined;
  return (
    <div
      className={`glass-chip rounded-control flex items-center gap-3 p-3 ${unavailable ? 'opacity-70' : ''}`}
    >
      <Checkbox
        checked={checked}
        disabled={alreadyHere || unavailable !== null}
        onCheckedChange={(v) => {
          onChange(v === true);
        }}
        className="min-w-0 flex-1 items-center"
        label={
          <span className="flex min-w-0 items-center gap-3">
            <Avatar name={asset.displayName} src={asset.avatarUrl} size="md" decorative />
            <span className="flex min-w-0 flex-col">
              <span className="text-ink truncate font-medium">{asset.displayName}</span>
              {asset.username && (
                <span className="text-ink-3 truncate text-xs">@{asset.username}</span>
              )}
            </span>
          </span>
        }
        {...(note ? { description: note } : {})}
      />
      {alreadyHere && <Badge tone="success">{t('picker.added')}</Badge>}
    </div>
  );
}

function LoadFailed({
  provider,
  connectionId,
  error,
}: {
  provider: LoginProvider;
  connectionId: string;
  error: unknown;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const name = t(`providers.${provider}`);
  const refused = error instanceof ApiError && error.code === 'CONNECTION_REAUTH_REQUIRED';
  const message = refused
    ? t('picker.needsReconnect', { provider: name })
    : networkDidNotAnswer(error)
      ? t('picker.networkDown', { provider: name })
      : errorMessage(error);
  const action = async () => {
    if (!refused) {
      await queryClient.refetchQueries({
        queryKey: connectableAssetsQuery(workspace.id, connectionId).queryKey,
      });
      return;
    }
    setBusy(true);
    try {
      await startReconnect(workspace.id, connectionId);
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  };
  return (
    <EmptyState
      icon={<CircleAlert className="text-danger" />}
      title={t('picker.loadError')}
      description={message}
      action={
        <Button variant="primary" disabled={busy} onClick={() => void action()}>
          {refused && <RefreshCw aria-hidden="true" />}
          {refused ? t('login.reconnect') : t('retry')}
        </Button>
      }
    />
  );
}
