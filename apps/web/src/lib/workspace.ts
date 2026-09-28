import type { Me } from '@socioboard/contracts';
import { createContext, useContext } from 'react';

export type Membership = Me['memberships'][number];

/** The membership for `slug`, or undefined when the user doesn't belong to that workspace. */
export function membershipFor(me: Me, slug: string): Membership | undefined {
  return me.memberships.find((m) => m.workspace.slug === slug);
}

export interface WorkspaceScope {
  me: Me;
  workspace: Membership['workspace'];
  role: Membership['role'];
}

/**
 * Set by the app shell from the live `me`: the workspace in the URL on `/w/$slug/*`, or the active
 * workspace on account pages (`/me/*`).
 */
export const WorkspaceContext = createContext<WorkspaceScope | null>(null);

/** The current workspace and my role in it. Only for pages inside the app shell. */
export function useWorkspace(): WorkspaceScope {
  const scope = useContext(WorkspaceContext);
  if (!scope) throw new Error('useWorkspace() used outside the app shell');
  return scope;
}
