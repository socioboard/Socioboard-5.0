import type { Permission } from '@socioboard/contracts';
import { CalendarDays, type LucideIcon } from 'lucide-react';

/**
 * The sidebar, bottom tab bar and command palette all read this list. A page joins it when its
 * route exists (the `to` type checks that): Settings with P0-F6, Media with P0-F7, and the rest with
 * their phases. Items the user's role can't use are hidden (docs/frontend/areas/app-shell.md).
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
] as const satisfies readonly {
  id: string;
  to: string;
  icon: LucideIcon;
  label: `nav.${string}`;
  keywords: string;
  permission: Permission;
}[];

export type NavItem = (typeof NAV_ITEMS)[number];
