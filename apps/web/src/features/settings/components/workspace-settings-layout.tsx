import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { SettingsPage } from './settings-page';

/** `/w/:slug/settings/*`: the header and tabs; General only for those who can change it. */
export function WorkspaceSettingsLayout() {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  const can = useCan();
  const params = { slug: workspace.slug };
  return (
    <SettingsPage
      title={t('title')}
      tabs={
        <>
          {can('workspace:update') && (
            <Link to="/w/$slug/settings/general" params={params}>
              {t('tabs.general')}
            </Link>
          )}
          <Link to="/w/$slug/settings/members" params={params}>
            {t('tabs.members')}
          </Link>
        </>
      }
    >
      <Outlet />
    </SettingsPage>
  );
}
