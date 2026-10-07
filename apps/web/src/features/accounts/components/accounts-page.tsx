import type { NetworkId, SocialAccount } from '@socioboard/contracts';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  NavTabs,
  NetworkIcon,
  networkName,
  PageHeader,
  Skeleton,
  staggerStyle,
  toast,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import {
  accountsQuery,
  connectionsQuery,
  groupAccounts,
  networksQuery,
  startReconnect,
  type LoginGroup,
  type NetworkSection,
} from '../api';
import { connectErrorText } from '../errors';
import { AccountDrawer } from './account-drawer';
import { ConnectDialog } from './connect-dialog';
import { GroupsTab } from './groups-tab';
import { LoginDrawer } from './login-drawer';

export interface AccountsSearch {
  /** The account whose details are open. */
  account?: string | undefined;
  /** The login whose details are open. */
  login?: string | undefined;
  /** A connect that failed before it knew the workspace (from `/?connectError=`). */
  connectError?: string | undefined;
  /** The Groups tab (P3-F3); the accounts list when absent. */
  tab?: 'groups' | undefined;
}

/** `/w/:slug/accounts`: connected accounts by network, then by the login they come through. */
export function AccountsPage({
  search,
  onSearchChange,
}: {
  search: AccountsSearch;
  onSearchChange: (patch: Partial<AccountsSearch>) => void;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const canConnect = can('accounts:connect');
  const canManage = can('accounts:manage');
  const accounts = useQuery(accountsQuery(workspace.id));
  const networks = useQuery(networksQuery);
  const connections = useQuery({ ...connectionsQuery(workspace.id), enabled: canManage });
  // Which network the chooser opens on ("Connect another Facebook account"); null: closed.
  const [chooser, setChooser] = useState<{ network?: NetworkId } | null>(null);

  const sections =
    accounts.data &&
    groupAccounts(accounts.data, networks.data ?? [], canManage ? connections.data : []);

  let body;
  if (accounts.isPending) {
    body = <SkeletonSections />;
  } else if (accounts.isError) {
    body = (
      <EmptyState
        title={t('loadError')}
        action={<Button onClick={() => void accounts.refetch()}>{t('retry')}</Button>}
      />
    );
  } else if (!sections || sections.length === 0) {
    body = (
      <EmptyState
        icon={
          <span className="flex gap-1">
            <NetworkIcon network="facebook_page" variant="tile" size="sm" decorative />
            <NetworkIcon network="instagram" variant="tile" size="sm" decorative />
          </span>
        }
        title={t('empty.title')}
        description={canConnect ? t('empty.body') : t('empty.readOnlyBody')}
        {...(canConnect
          ? {
              action: (
                <Button
                  onClick={() => {
                    setChooser({});
                  }}
                >
                  <Plus aria-hidden="true" />
                  {t('connect')}
                </Button>
              ),
            }
          : {})}
      />
    );
  } else {
    body = sections.map((s) => (
      <NetworkSectionView
        key={s.network}
        section={s}
        canConnect={canConnect}
        canManage={canManage}
        onConnectAnother={() => {
          setChooser({ network: s.network });
        }}
        onOpenAccount={(id) => {
          onSearchChange({ account: id });
        }}
        onOpenLogin={(id) => {
          onSearchChange({ login: id });
        }}
      />
    ));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('title')}
        actions={
          canConnect && (
            <Button
              variant="primary"
              size="sm"
              aria-label={t('connect')}
              onClick={() => {
                setChooser({});
              }}
            >
              <Plus aria-hidden="true" />
              <span className="hidden sm:inline" aria-hidden="true">
                {t('connect')}
              </span>
            </Button>
          )
        }
      />
      <NavTabs aria-label={t('tabs.label')}>
        {([undefined, 'groups'] as const).map((tab) => (
          <Link
            key={tab ?? 'accounts'}
            to="/w/$slug/accounts"
            params={{ slug: workspace.slug }}
            search={{ tab }}
            // "Accounts" (no ?tab) must not light up on the Groups tab.
            activeOptions={{ includeSearch: true, explicitUndefined: true }}
          >
            {t(tab ? 'tabs.groups' : 'tabs.accounts')}
          </Link>
        ))}
      </NavTabs>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="stagger-children mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-5 sm:px-6">
          {search.connectError && (
            <Banner
              tone="danger"
              onDismiss={() => {
                onSearchChange({ connectError: undefined });
              }}
              dismissLabel={t('connectError.dismiss')}
            >
              <strong className="font-semibold">{t('connectError.titleGeneric')}.</strong>{' '}
              {connectErrorText(search.connectError)}
            </Banner>
          )}
          {search.tab === 'groups' ? (
            <GroupsTab accounts={accounts.data ?? []} canManage={canManage} />
          ) : (
            body
          )}
        </div>
      </div>
      {canConnect && (
        <ConnectDialog
          open={chooser !== null}
          onOpenChange={(open) => {
            if (!open) setChooser(null);
          }}
          initialNetwork={chooser?.network}
          existingProviders={
            new Set(
              (accounts.data ?? [])
                .flatMap((a) => (a.connection ? [a.connection.provider] : []))
                .concat((connections.data ?? []).map((c) => c.provider)),
            )
          }
        />
      )}
      <AccountDrawer
        accountId={search.account}
        onClose={() => {
          onSearchChange({ account: undefined });
        }}
      />
      {canManage && (
        <LoginDrawer
          connectionId={search.login}
          onClose={() => {
            onSearchChange({ login: undefined });
          }}
          onOpenAccount={(id) => {
            onSearchChange({ login: undefined, account: id });
          }}
        />
      )}
    </div>
  );
}

function NetworkSectionView({
  section,
  canConnect,
  canManage,
  onConnectAnother,
  onOpenAccount,
  onOpenLogin,
}: {
  section: NetworkSection;
  canConnect: boolean;
  canManage: boolean;
  onConnectAnother: () => void;
  onOpenAccount: (id: string) => void;
  onOpenLogin: (id: string) => void;
}) {
  const { t } = useTranslation('accounts');
  const name = section.enabled?.displayName ?? networkName(section.network);
  const headingId = `network-${section.network}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <NetworkIcon network={section.network} variant="tile" size="md" decorative />
        <div className="flex min-w-0 flex-col">
          <h2 id={headingId} className="text-ink text-[15px] font-semibold tracking-tight">
            {name}
          </h2>
          <span className="text-ink-3 text-xs">{t('count', { count: section.count })}</span>
        </div>
        {canConnect && section.enabled && (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={onConnectAnother}>
            <Plus aria-hidden="true" />
            {t('connectAnother', { network: name })}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {section.logins.map((group) => (
          <LoginGroupView
            key={group.connection?.id ?? 'none'}
            group={group}
            canConnect={canConnect}
            canManage={canManage}
            onOpenAccount={onOpenAccount}
            onOpenLogin={onOpenLogin}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * One login and the accounts reached through it. A thread runs from the login down its
 * accounts, so it reads which person each Page comes through at a glance.
 */
function LoginGroupView({
  group,
  canConnect,
  canManage,
  onOpenAccount,
  onOpenLogin,
}: {
  group: LoginGroup;
  canConnect: boolean;
  canManage: boolean;
  onOpenAccount: (id: string) => void;
  onOpenLogin: (id: string) => void;
}) {
  const { t } = useTranslation('accounts');
  const { workspace } = useWorkspace();
  const [reconnecting, setReconnecting] = useState(false);
  const c = group.connection;
  const provider = c ? t(`providers.${c.provider}`) : '';
  const needsReconnect = c !== null && c.status !== 'active';

  const reconnect = async () => {
    if (!c) return;
    setReconnecting(true);
    try {
      await startReconnect(workspace.id, c.id);
    } catch (err) {
      toast.error(errorMessage(err));
      setReconnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {c && (
        <div className="flex min-h-9 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Avatar name={c.displayName} src={c.avatarUrl} size="sm" decorative />
          <span className="text-ink text-sm font-medium">{c.displayName}</span>
          <span className="text-ink-3 text-xs">{t('login.via', { provider })}</span>
          {needsReconnect && (
            <Badge tone="danger" dot>
              {t(`status.${c.status}`)}
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1">
            {canConnect && needsReconnect && (
              <Button size="sm" disabled={reconnecting} onClick={() => void reconnect()}>
                <RefreshCw aria-hidden="true" />
                {t('login.reconnect')}
              </Button>
            )}
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                aria-label={t('login.manageLabel', { name: c.displayName, provider })}
                onClick={() => {
                  onOpenLogin(c.id);
                }}
              >
                {t('login.manage')}
              </Button>
            )}
          </div>
        </div>
      )}
      <div className={c ? 'border-hair-strong ml-3 border-l pl-5' : ''}>
        {group.accounts.length === 0 ? (
          <p className="text-ink-3 flex flex-wrap items-center gap-x-3 gap-y-1 py-1 text-sm">
            {t('login.nothingAdded')}
            {canConnect && c && (
              <Link
                to="/w/$slug/accounts/connect/$provider"
                params={{ slug: workspace.slug, provider: c.provider }}
                search={{ connection: c.id }}
                className="text-ring font-medium hover:underline"
              >
                {t('login.addFrom')}
              </Link>
            )}
          </p>
        ) : (
          <ul className="grid gap-2 @xl:grid-cols-2 @4xl:grid-cols-3">
            {group.accounts.map((a, i) => (
              <li key={a.id} className="animate-enter" style={staggerStyle(i)}>
                <AccountRow
                  account={a}
                  onOpen={() => {
                    onOpenAccount(a.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function AccountRow({ account, onOpen }: { account: SocialAccount; onOpen: () => void }) {
  const { t } = useTranslation('accounts');
  const network = networkName(account.network);
  const attention = account.status !== 'active';
  return (
    <Card className="hover-lift h-full">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('account.open', { name: account.displayName, network })}
        className="hover:bg-chip focus-visible:ring-selected flex h-full w-full items-center gap-3 p-3 text-left outline-none"
      >
        <span className="relative shrink-0">
          <Avatar name={account.displayName} src={account.avatarUrl} size="lg" decorative />
          <NetworkIcon
            network={account.network}
            variant="tile"
            size="xs"
            decorative
            className="ring-canvas absolute -right-1 -bottom-1 ring-2"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-ink truncate text-sm font-medium">{account.displayName}</span>
          <span className="text-ink-3 line-clamp-2 text-xs">
            {account.username
              ? `@${account.username}`
              : account.connectedBy
                ? t('account.connectedBy', {
                    name: account.connectedBy.name,
                    date: formatDate(account.createdAt),
                  })
                : t('account.connectedOn', { date: formatDate(account.createdAt) })}
          </span>
          {attention && (
            <Badge
              tone={account.status === 'paused' ? 'warning' : 'danger'}
              dot
              className="mt-1 self-start"
            >
              {t(`status.${account.status}`)}
            </Badge>
          )}
        </span>
        <ChevronRight className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
      </button>
    </Card>
  );
}

function SkeletonSections() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {[3, 2].map((n, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid gap-2 @xl:grid-cols-2 @4xl:grid-cols-3">
            {Array.from({ length: n }, (_, j) => (
              <Skeleton key={j} className="rounded-control h-16" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
