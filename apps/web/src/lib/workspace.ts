import type { Me } from '@socioboard/contracts';
import { useParams } from '@tanstack/react-router';

import { useMe } from './session';

export type Membership = Me['memberships'][number];

/** The membership for `slug`, or undefined when the user doesn't belong to that workspace. */
export function membershipFor(me: Me, slug: string): Membership | undefined {
  return me.memberships.find((m) => m.workspace.slug === slug);
}

/**
 * The workspace in the URL (`/w/$slug`) and my role in it, from the live `me`. Only for pages
 * inside the app shell, which renders its pages only when the user is signed in and a member.
 */
export function useWorkspace(): {
  me: Me;
  workspace: Membership['workspace'];
  role: Membership['role'];
} {
  const { slug } = useParams({ from: '/w/$slug' });
  const me = useMe().data;
  const membership = me ? membershipFor(me, slug) : undefined;
  if (!me || !membership) throw new Error('useWorkspace() used outside the app shell');
  return { me, workspace: membership.workspace, role: membership.role };
}
