import type { Me } from '@socioboard/contracts';
import { Drawer, DrawerContent, DrawerTitle } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import type { NavItem } from '../nav';
import { ThemeToggle, UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';

const tab =
  'text-ink-3 flex h-12 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-control text-[11px] font-medium';

/**
 * Under 768 px the sidebar becomes this bottom tab bar: the pages, plus "Menu", a sheet with the
 * workspace switcher, search and account.
 */
export function MobileTabBar({
  me,
  membership,
  items,
  onSearch,
}: {
  me: Me;
  membership: Membership;
  items: readonly NavItem[];
  onSearch: () => void;
}) {
  const { t } = useTranslation('shell');
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav
        aria-label={t('nav.label')}
        className="glass rounded-pane flex shrink-0 items-stretch gap-1 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            params={{ slug: membership.workspace.slug }}
            className={`${tab} data-[status=active]:bg-chip data-[status=active]:text-ink`}
          >
            <item.icon className="size-5" aria-hidden="true" />
            {t(item.label)}
          </Link>
        ))}
        <button type="button" className={tab} onClick={onSearch} aria-label={t('search.button')}>
          <Search className="size-5" aria-hidden="true" />
          {t('mobile.search')}
        </button>
        <button
          type="button"
          className={tab}
          aria-haspopup="dialog"
          onClick={() => {
            setMenuOpen(true);
          }}
        >
          <Menu className="size-5" aria-hidden="true" />
          {t('mobile.menu')}
        </button>
      </nav>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent closeLabel={t('mobile.close')} className="gap-3 p-4">
          <DrawerTitle className="sr-only">{t('mobile.menu')}</DrawerTitle>
          <div className="pr-10">
            <WorkspaceSwitcher me={me} current={membership.workspace} />
          </div>
          <div className="border-hair flex items-center gap-1 border-t pt-3">
            <UserMenu me={me} role={membership.role} side="top" />
            <ThemeToggle />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
