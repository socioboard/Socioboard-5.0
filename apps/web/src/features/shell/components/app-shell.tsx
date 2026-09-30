import { can } from '@socioboard/contracts';
import { TooltipProvider } from '@socioboard/ui';
import { Outlet, useParams } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

import { useMe } from '../../../lib/session';
import { membershipFor, WorkspaceContext } from '../../../lib/workspace';
import {
  useActiveWorkspaceSync,
  useCommandShortcut,
  useSessionWatcher,
  useSidebarCollapsed,
} from '../hooks';
import { NAV_ITEMS } from '../nav';
import { CommandMenu } from './command-menu';
import { MobileTabBar } from './mobile-tab-bar';
import { ShellBanners } from './shell-banners';
import { Sidebar } from './sidebar';
import { WorkspaceNotFound } from './workspace-not-found';

/**
 * The frame around every workspace page (`/w/$slug/*`): sidebar or bottom tab bar, banners, ⌘K.
 * Pages render into the content pane and start with a PageHeader.
 */
export function AppShell() {
  const { slug } = useParams({ from: '/w/$slug' });
  return <WorkspaceShell slug={slug} />;
}

/**
 * Account pages (`/me/*`) use the same frame, on the active workspace (else the first). The route
 * sends people without a workspace to setup first.
 */
export function AccountShell() {
  const me = useMe().data;
  const active =
    me?.memberships.find((m) => m.workspace.id === me.activeWorkspaceId) ?? me?.memberships[0];
  return <WorkspaceShell slug={active?.workspace.slug ?? ''} />;
}

function WorkspaceShell({ slug }: { slug: string }) {
  useSessionWatcher();
  const me = useMe().data;
  // Signed out mid-use: the session watcher is already on its way to the sign-in page.
  if (!me) return null;
  const membership = membershipFor(me, slug);
  if (!membership) return <WorkspaceNotFound me={me} />;
  return <ShellLayout me={me} membership={membership} />;
}

function ShellLayout({
  me,
  membership,
}: {
  me: NonNullable<ReturnType<typeof useMe>['data']>;
  membership: NonNullable<ReturnType<typeof membershipFor>>;
}) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);
  // The shortcut toggles, as in Linear and Raycast; the search button only opens.
  const toggleSearch = useCallback(() => {
    setSearchOpen((open) => !open);
  }, []);
  useCommandShortcut(toggleSearch);
  useActiveWorkspaceSync(membership.workspace.id, me.activeWorkspaceId);
  const items = useMemo(
    () =>
      NAV_ITEMS.filter((item) => !('permission' in item) || can(membership.role, item.permission)),
    [membership.role],
  );

  const canCompose = can(membership.role, 'posts:create');

  const scope = useMemo(
    () => ({ me, workspace: membership.workspace, role: membership.role }),
    [me, membership],
  );

  // Tooltips live only in the shell, so sign-in pages don't load them.
  return (
    <WorkspaceContext value={scope}>
      <TooltipProvider>
        <div className="flex h-dvh flex-col gap-3 p-3 md:flex-row">
          <Sidebar
            me={me}
            membership={membership}
            items={items}
            canCompose={canCompose}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onSearch={openSearch}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <ShellBanners me={me} />
            <main className="glass rounded-pane animate-settle sb-page flex min-h-0 flex-1 flex-col overflow-hidden [animation-delay:60ms]">
              <Outlet />
            </main>
          </div>
          <MobileTabBar
            me={me}
            membership={membership}
            items={items}
            canCompose={canCompose}
            onSearch={openSearch}
          />
          <CommandMenu
            open={searchOpen}
            onOpenChange={setSearchOpen}
            me={me}
            membership={membership}
            items={items}
            canCompose={canCompose}
            sidebarCollapsed={collapsed}
            onSidebarCollapsedChange={setCollapsed}
          />
        </div>
      </TooltipProvider>
    </WorkspaceContext>
  );
}
