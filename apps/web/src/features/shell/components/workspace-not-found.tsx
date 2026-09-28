import type { Me } from '@socioboard/contracts';
import { Avatar, Button } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from '../../auth';

/**
 * `/w/<slug>` for a workspace that doesn't exist or I'm not in. The same answer either way, so a
 * slug can't be probed; offers my own workspaces instead.
 */
export function WorkspaceNotFound({ me }: { me: Me }) {
  const { t } = useTranslation('shell');
  return (
    <AuthLayout title={t('notFound.title')} subtitle={t('notFound.body')}>
      {me.memberships.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {me.memberships.map(({ workspace, role }) => (
            <li key={workspace.id}>
              <Link
                to="/w/$slug"
                params={{ slug: workspace.slug }}
                className="glass-chip hover:border-hair-strong flex items-center gap-3 rounded-control p-2.5"
              >
                <Avatar name={workspace.name} src={workspace.logoUrl} size="sm" decorative />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {workspace.name}
                </span>
                <span className="text-ink-3 text-xs">{t(`roles.${role}`)}</span>
                <ChevronRight className="text-ink-3 size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-2 text-sm">{t('notFound.none')}</p>
      )}
      <Button asChild size="lg">
        <Link to="/onboarding">{t('notFound.create')}</Link>
      </Button>
    </AuthLayout>
  );
}
