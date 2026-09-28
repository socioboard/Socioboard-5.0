import type { Me } from '@socioboard/contracts';
import { CommandPalette, useTheme, type CommandGroup } from '@socioboard/ui';
import { useNavigate } from '@tanstack/react-router';
import {
  Building2,
  LogOut,
  Monitor,
  Moon,
  PanelLeft,
  Plus,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import { useSignOut } from '../../auth';
import type { NavItem } from '../nav';

/** ⌘K: the pages, my workspaces, theme and sidebar, and sign out. */
export function CommandMenu({
  open,
  onOpenChange,
  me,
  membership,
  items,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me: Me;
  membership: Membership;
  items: readonly NavItem[];
  sidebarCollapsed: boolean;
  onSidebarCollapsedChange: (collapsed: boolean) => void;
}) {
  const { t } = useTranslation('shell');
  const navigate = useNavigate();
  const { setPreference } = useTheme();
  const signOut = useSignOut();
  const slug = membership.workspace.slug;

  const groups = useMemo<CommandGroup[]>(
    () => [
      {
        heading: t('search.goTo'),
        commands: items.map((item) => ({
          id: `go-${item.id}`,
          label: t(item.label),
          icon: item.icon,
          keywords: item.keywords,
          onSelect: () => {
            void navigate({ to: item.to, params: { slug } });
          },
        })),
      },
      {
        heading: t('search.workspaces'),
        commands: [
          ...me.memberships.map(({ workspace, role }) => ({
            id: `workspace-${workspace.id}`,
            label: workspace.name,
            icon: Building2,
            hint:
              workspace.id === membership.workspace.id ? t('search.current') : t(`roles.${role}`),
            keywords: `switch ${workspace.slug}`,
            onSelect: () => {
              void navigate({ to: '/w/$slug', params: { slug: workspace.slug } });
            },
          })),
          {
            id: 'workspace-create',
            label: t('switcher.create'),
            icon: Plus,
            keywords: 'new add',
            onSelect: () => {
              void navigate({ to: '/onboarding' });
            },
          },
        ],
      },
      {
        heading: t('search.preferences'),
        commands: [
          {
            id: 'theme-light',
            label: t('search.themeLight'),
            icon: Sun,
            keywords: 'appearance mode',
            onSelect: () => {
              setPreference('light');
            },
          },
          {
            id: 'theme-dark',
            label: t('search.themeDark'),
            icon: Moon,
            keywords: 'appearance mode night',
            onSelect: () => {
              setPreference('dark');
            },
          },
          {
            id: 'theme-system',
            label: t('search.themeSystem'),
            icon: Monitor,
            keywords: 'appearance mode auto',
            onSelect: () => {
              setPreference('system');
            },
          },
          {
            id: 'sidebar',
            label: sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse'),
            icon: PanelLeft,
            keywords: 'navigation menu',
            onSelect: () => {
              onSidebarCollapsedChange(!sidebarCollapsed);
            },
          },
        ],
      },
      {
        heading: t('search.account'),
        commands: [
          {
            id: 'profile',
            label: t('user.profile'),
            icon: UserRound,
            keywords: 'name photo avatar time zone',
            onSelect: () => {
              void navigate({ to: '/me/profile' });
            },
          },
          {
            id: 'security',
            label: t('user.security'),
            icon: ShieldCheck,
            keywords: 'password two-factor 2fa sessions devices',
            onSelect: () => {
              void navigate({ to: '/me/security' });
            },
          },
          {
            id: 'sign-out',
            label: t('user.signOut'),
            icon: LogOut,
            keywords: 'log out logout',
            onSelect: () => {
              void signOut();
            },
          },
        ],
      },
    ],
    [
      t,
      items,
      me.memberships,
      membership.workspace.id,
      slug,
      sidebarCollapsed,
      navigate,
      setPreference,
      onSidebarCollapsedChange,
      signOut,
    ],
  );

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      groups={groups}
      title={t('search.title')}
      searchLabel={t('search.button')}
      emptyText={t('search.empty')}
    />
  );
}
