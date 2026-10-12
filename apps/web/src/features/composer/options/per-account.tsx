import { Avatar } from '@socioboard/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { PanelAccount } from './types';

/**
 * For the network panels (P3-F2), in its own file so they can import it: panels.tsx imports the
 * registry, which imports the panels, so a panel importing panels.tsx would be a cycle.
 *
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
