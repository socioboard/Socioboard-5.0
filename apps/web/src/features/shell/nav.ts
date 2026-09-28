import type { Permission } from '@socioboard/contracts';
import { CalendarDays, Images, Settings, type LucideIcon } from 'lucide-react';

/**
 * The sidebar, bottom tab bar and command palette all read this list. A page joins it when its
 * route exists (the `to` type checks that); the rest join with their phases. Items the
 * user's role can't use are hidden (docs/frontend/areas/app-shell.md); no `permission` means every
 * member (Settings: anyone can see the members list).
 */
export const NAV_ITEMS = [
  {
    id: 'calendar',
    to: '/w/$slug/calendar',
    icon: CalendarDays,
    label: 'nav.calendar',
    keywords: 'schedule week month plan',
    permission: 'calendar:read',
  },
  {
    id: 'media',
    to: '/w/$slug/media',
    icon: Images,
    label: 'nav.media',
    keywords: 'images videos photos library upload files',
    permission: 'media:read',
  },
  {
    id: 'settings',
    to: '/w/$slug/settings',
    icon: Settings,
    label: 'nav.settings',
    keywords: 'workspace members invite team roles logo',
  },
] as const satisfies readonly {
  id: string;
  to: string;
  icon: LucideIcon;
  label: `nav.${string}`;
  keywords: string;
  permission?: Permission;
}[];

export type NavItem = (typeof NAV_ITEMS)[number];
