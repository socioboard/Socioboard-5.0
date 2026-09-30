import type { Me } from '@socioboard/contracts';
import { buttonVariants, cn, Kbd, Tooltip } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { PanelLeftClose, PanelLeftOpen, Search, SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import { commandShortcutLabel } from '../hooks';
import type { NavItem } from '../nav';
import { ThemeToggle, UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';

export interface SidebarProps {
  me: Me;
  membership: Membership;
  items: readonly NavItem[];
  /** Shows the primary "New post" button (people who can write posts). */
  canCompose: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onSearch: () => void;
}

/** The left pane on tablets and up: workspace, search, pages, and who is signed in. */
export function Sidebar({
  me,
  membership,
  items,
  canCompose,
  collapsed,
  onCollapsedChange,
  onSearch,
}: SidebarProps) {
  const { t } = useTranslation('shell');
  const toggleLabel = collapsed ? t('sidebar.expand') : t('sidebar.collapse');
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <nav
      aria-label={t('nav.label')}
      data-collapsed={collapsed ? '' : undefined}
      className={cn(
        'glass rounded-pane animate-settle hidden shrink-0 flex-col gap-1 p-3 md:flex',
        'w-[232px] transition-[width] duration-200 motion-reduce:transition-none',
        collapsed && 'w-16 items-center px-2',
      )}
    >
      <WorkspaceSwitcher me={me} current={membership.workspace} compact={collapsed} />

      {canCompose && (
        <Tooltip content={t('compose')} side="right" disabled={!collapsed}>
          <Link
            to="/w/$slug/compose/{-$postId}"
            params={{ slug: membership.workspace.slug, postId: undefined }}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'md' }),
              'mt-2 w-full',
              collapsed && 'size-9 px-0',
            )}
            {...(collapsed ? { 'aria-label': t('compose') } : {})}
          >
            <SquarePen aria-hidden="true" />
            {!collapsed && t('compose')}
          </Link>
        </Tooltip>
      )}

      <Tooltip content={t('search.button')} side="right" disabled={!collapsed}>
        <button
          type="button"
          onClick={onSearch}
          aria-label={t('search.button')}
          aria-keyshortcuts="Meta+K Control+K"
          className={cn(
            'glass-chip text-ink-3 hover:text-ink mt-2 mb-3 flex h-9 w-full cursor-pointer items-center gap-2 rounded-control px-2.5 text-[13px] font-medium whitespace-nowrap',
            collapsed && 'size-9 justify-center px-0',
          )}
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">{t('search.button')}</span>
              <Kbd>{commandShortcutLabel()}</Kbd>
            </>
          )}
        </button>
      </Tooltip>

      <ul className="flex w-full flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <Tooltip content={t(item.label)} side="right" disabled={!collapsed}>
              <Link
                to={item.to}
                params={{ slug: membership.workspace.slug }}
                className={cn(
                  'text-ink-2 hover:bg-chip hover:text-ink flex h-[34px] items-center gap-2.5 rounded-control border border-transparent px-2.5 text-[13px] font-medium',
                  'data-[status=active]:bg-glass data-[status=active]:border-edge data-[status=active]:text-ink',
                  'data-[status=active]:shadow-[inset_0_1px_0_var(--sb-spec),0_1px_2px_rgb(0_0_0/0.06)]',
                  collapsed && 'justify-center px-0',
                )}
                {...(collapsed ? { 'aria-label': t(item.label) } : {})}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && t(item.label)}
              </Link>
            </Tooltip>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          'border-hair mt-auto flex w-full items-center gap-1 border-t pt-2',
          collapsed && 'flex-col',
        )}
      >
        <UserMenu me={me} role={membership.role} compact={collapsed} side="top" />
        <ThemeToggle />
        <Tooltip content={toggleLabel} side="right">
          <button
            type="button"
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            onClick={() => {
              onCollapsedChange(!collapsed);
            }}
            className="text-ink-2 hover:bg-chip hover:text-ink inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg"
          >
            <ToggleIcon className="size-4" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}
