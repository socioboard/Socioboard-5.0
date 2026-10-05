import type { Me } from '@socioboard/contracts';
import {
  buttonVariants,
  Drawer,
  DrawerContent,
  DrawerTitle,
  motion,
  springs,
} from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, Menu, Search, SquarePen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import { bellQuery, UnreadBadge } from '../../notifications';
import type { NavItem } from '../nav';
import { ThemeToggle, UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';

/** Pages that fit in the bar beside Search and Menu; the rest are in the Menu sheet. */
const IN_BAR = 4;

const tab =
  'text-ink-3 flex h-12 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-control text-[11px] font-medium';

/**
 * Under 768 px the sidebar becomes this bottom tab bar: the first pages, Search, and "Menu", a
 * sheet with the workspace switcher, New post, the other pages, notifications and the account.
 */
export function MobileTabBar({
  me,
  membership,
  items,
  canCompose,
  onSearch,
}: {
  me: Me;
  membership: Membership;
  items: readonly NavItem[];
  canCompose: boolean;
  onSearch: () => void;
}) {
  const { t } = useTranslation('shell');
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = useQuery(bellQuery).data?.unreadCount ?? 0;
  return (
    <>
      <nav
        aria-label={t('nav.label')}
        className="glass rounded-pane flex shrink-0 items-stretch gap-1 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {items.slice(0, IN_BAR).map((item) => (
          <Link
            key={item.id}
            to={item.to}
            params={{ slug: membership.workspace.slug }}
            className={`${tab} relative isolate transition-colors duration-200 data-[status=active]:text-ink`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sb-tab-active"
                    aria-hidden="true"
                    className="bg-chip rounded-control absolute inset-0 -z-10"
                    transition={springs.snappy}
                  />
                )}
                <item.icon className="size-5" aria-hidden="true" />
                {t(item.label)}
              </>
            )}
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
          aria-label={unread > 0 ? t('mobile.menuUnread', { count: unread }) : t('mobile.menu')}
          onClick={() => {
            setMenuOpen(true);
          }}
        >
          <span className="relative inline-flex">
            <Menu className="size-5" aria-hidden="true" />
            <UnreadBadge count={unread} className="-top-1.5 -right-2.5" />
          </span>
          {t('mobile.menu')}
        </button>
      </nav>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerContent closeLabel={t('mobile.close')} className="gap-3 p-4">
          <DrawerTitle className="sr-only">{t('mobile.menu')}</DrawerTitle>
          <div className="pr-10">
            <WorkspaceSwitcher me={me} current={membership.workspace} />
          </div>
          {canCompose && (
            <Link
              to="/w/$slug/compose/{-$postId}"
              params={{ slug: membership.workspace.slug, postId: undefined }}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              <SquarePen aria-hidden="true" />
              {t('compose')}
            </Link>
          )}
          {items.length > IN_BAR && (
            <ul className="flex flex-col gap-1">
              {items.slice(IN_BAR).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    params={{ slug: membership.workspace.slug }}
                    className="text-ink-2 hover:bg-chip hover:text-ink data-[status=active]:bg-chip data-[status=active]:text-ink flex h-11 items-center gap-3 rounded-control px-3.5 text-sm font-medium"
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <item.icon className="size-4" aria-hidden="true" />
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/me/notifications"
            className="glass-chip text-ink hover:bg-glass-solid flex h-11 items-center gap-3 rounded-control px-3.5 text-sm font-medium"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <Bell className="text-ink-2 size-4" aria-hidden="true" />
            <span className="flex-1">{t('mobile.notifications')}</span>
            {unread > 0 && (
              <span className="accent-lit rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Link>
          <div className="border-hair flex items-center gap-1 border-t pt-3">
            <UserMenu me={me} role={membership.role} side="top" />
            <ThemeToggle />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
