import type { Me } from '@socioboard/contracts';
import { AnimatePresence, buttonVariants, cn, Kbd, motion, springs, Tooltip } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { PanelLeftClose, PanelLeftOpen, Search, SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import { NotificationBell } from '../../notifications';
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
  /** A count beside a page (Posts: how many need fixing). */
  badges?: Partial<Record<NavItem['id'], string>>;
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
  badges = {},
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

      <div className={cn('mt-2 mb-3 flex w-full gap-1.5', collapsed && 'flex-col items-center')}>
        <Tooltip content={t('search.button')} side="right" disabled={!collapsed}>
          <button
            type="button"
            onClick={onSearch}
            aria-label={t('search.button')}
            aria-keyshortcuts="Meta+K Control+K"
            className={cn(
              'glass-chip text-ink-3 hover:text-ink flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-control px-2.5 text-[13px] font-medium whitespace-nowrap',
              collapsed && 'size-9 justify-center px-0',
            )}
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && (
              <>
                {/* Short beside the bell; the button's name is the full "Search or jump to". */}
                <span className="min-w-0 flex-1 truncate text-left">{t('mobile.search')}</span>
                <Kbd>{commandShortcutLabel()}</Kbd>
              </>
            )}
          </button>
        </Tooltip>
        <NotificationBell compact={collapsed} />
      </div>

      <ul className="flex w-full flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <Tooltip content={t(item.label)} side="right" disabled={!collapsed}>
              <Link
                to={item.to}
                params={{ slug: membership.workspace.slug }}
                className={cn(
                  'text-ink-2 hover:text-ink relative isolate flex h-[34px] items-center gap-2.5 rounded-control px-2.5 text-[13px] font-medium transition-colors duration-200',
                  'hover:bg-chip data-[status=active]:text-ink data-[status=active]:hover:bg-transparent',
                  collapsed && 'justify-center px-0',
                )}
                {...(collapsed ? { 'aria-label': t(item.label) } : {})}
              >
                {({ isActive }) => (
                  <>
                    {/* The highlight glides from the page left to the page opened. */}
                    {isActive && (
                      <motion.span
                        layoutId="sb-nav-active"
                        aria-hidden="true"
                        className="bg-glass border-edge rounded-control absolute inset-0 -z-10 border shadow-[inset_0_1px_0_var(--sb-spec),0_1px_2px_rgb(0_0_0/0.06)]"
                        transition={springs.snappy}
                      />
                    )}
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>}
                    <NavBadge
                      value={badges[item.id]}
                      dot={collapsed}
                      label={t(item.id === 'approvals' ? 'nav.waitingReview' : 'nav.needsFixing', {
                        count: badges[item.id] ?? '',
                      })}
                    />
                  </>
                )}
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

/** A count beside a page in the sidebar (a dot when it's collapsed); it pops in when it changes. */
export function NavBadge({
  value,
  dot = false,
  label,
}: {
  value: string | undefined;
  dot?: boolean;
  label: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {value && (
        <motion.span
          key={dot ? 'dot' : value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: springs.momentum }}
          exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.12 } }}
          className={cn(
            'bg-danger-tint text-danger shrink-0 rounded-full font-semibold tabular-nums',
            dot
              ? 'absolute top-1 right-1 size-2 bg-[var(--sb-danger)]'
              : 'px-1.5 py-px text-[11px]',
          )}
        >
          <span className="sr-only">{label}</span>
          {!dot && <span aria-hidden="true">{value}</span>}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
