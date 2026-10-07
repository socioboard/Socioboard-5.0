// Network options panels (P3-F2, docs/frontend/areas/composer.md "Per-network tabs"): one panel
// per network (`OPTION_PANELS`), shown in that network's tab. Each panel only draws its fields;
// this frame asks the accounts for their choices, shows waiting and failures, and files the
// values in the draft.
import type { NetworkId, SocialAccount } from '@socioboard/contracts';
import { Avatar, Banner, Button, Skeleton } from '@socioboard/ui';
import { useQueries } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { accountOptionsQuery } from '../../accounts';
import { accountOptionsFor, contentFor, type Draft, type DraftAction } from '../draft';
import { OPTION_PANELS } from './registry';
import type { OptionsPanel, PanelAccount } from './types';

/** The active network's panel, fed from the draft. Nothing for networks without a panel. */
export function OptionsSection({
  network,
  accounts,
  draft,
  dispatch,
}: {
  network: NetworkId;
  /** The selected accounts of `network`. */
  accounts: SocialAccount[];
  draft: Draft;
  dispatch: (action: DraftAction) => void;
}) {
  const panel = OPTION_PANELS[network];
  if (!panel) return null;
  return (
    <div className="flex flex-col gap-3" data-field="options">
      <PanelBody
        panel={panel}
        network={network}
        accounts={accounts}
        draft={draft}
        dispatch={dispatch}
      />
    </div>
  );
}

function PanelBody({
  panel,
  network,
  accounts,
  draft,
  dispatch,
}: {
  panel: OptionsPanel;
  network: NetworkId;
  accounts: SocialAccount[];
  draft: Draft;
  dispatch: (action: DraftAction) => void;
}) {
  const { t } = useTranslation('composer');
  const { workspace } = useWorkspace();
  const choices = useQueries({
    queries: accounts.map((a) => ({
      ...accountOptionsQuery(workspace.id, a.id),
      enabled: panel.needsChoices,
    })),
  });

  if (panel.needsChoices && choices.some((q) => q.isPending)) {
    return (
      <div role="status" aria-label={t('options.loading')} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="rounded-control h-10 w-full" />
      </div>
    );
  }

  const ready: PanelAccount[] = [];
  const failed: { account: SocialAccount; error: unknown; retry: () => void }[] = [];
  accounts.forEach((account, i) => {
    const q = choices[i];
    if (panel.needsChoices && q?.isError) {
      failed.push({ account, error: q.error, retry: () => void q.refetch() });
      return;
    }
    ready.push({
      account,
      choices: panel.needsChoices ? q?.data : undefined,
      own: accountOptionsFor(draft, account.id, network),
      setOwn: (key, values) => {
        dispatch({ type: 'accountOptions', accountId: account.id, key, values });
      },
    });
  });

  const { Component } = panel;
  return (
    <>
      {failed.map(({ account, error, retry }) => (
        <Banner
          key={account.id}
          tone="danger"
          action={
            <Button variant="secondary" size="sm" onClick={retry}>
              {t('options.retry')}
            </Button>
          }
        >
          {t('options.failed', { account: account.displayName, reason: errorMessage(error) })}
        </Banner>
      ))}
      {ready.length > 0 && (
        <Component
          network={network}
          accounts={ready}
          options={contentFor(draft, network).options}
          set={(key, values) => {
            dispatch({ type: 'options', network, key, values });
          }}
        />
      )}
    </>
  );
}

/**
 * A setting each account makes for itself (a board, a privacy level): the field once when there's
 * one account, else a row per account with its name.
 */
export function PerAccount({
  accounts,
  label,
  children,
}: {
  accounts: PanelAccount[];
  label: string;
  children: (account: PanelAccount, label: string) => ReactNode;
}) {
  const { t } = useTranslation('composer');
  const [only] = accounts;
  if (accounts.length === 1 && only) return children(only, label);
  return (
    <div className="flex flex-col gap-2.5">
      {accounts.map((a) => (
        <div key={a.account.id} className="flex items-center gap-2.5">
          <Avatar name={a.account.displayName} src={a.account.avatarUrl} size="sm" decorative />
          <div className="min-w-0 flex-1">
            {children(a, t('options.forAccount', { label, account: a.account.displayName }))}
          </div>
        </div>
      ))}
    </div>
  );
}
