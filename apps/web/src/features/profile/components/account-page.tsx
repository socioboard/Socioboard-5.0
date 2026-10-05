import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsPage } from '../../settings';

/** `/me/*`: the account header and its Profile / Security / Notifications tabs. */
export function AccountPage({ children }: { children: ReactNode }) {
  const { t } = useTranslation('account');
  return (
    <SettingsPage
      title={t('title')}
      tabs={
        <>
          <Link to="/me/profile">{t('tabs.profile')}</Link>
          <Link to="/me/security">{t('tabs.security')}</Link>
          <Link to="/me/notifications">{t('tabs.notifications')}</Link>
        </>
      }
    >
      {children}
    </SettingsPage>
  );
}
