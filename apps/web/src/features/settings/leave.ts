import type { QueryClient } from '@tanstack/react-query';
import type { UseNavigateResult } from '@tanstack/react-router';

import { meQuery } from '../../lib/session';
import { workspaceKeys } from './api';

/**
 * After deleting or leaving a workspace: go to another of mine (or setup) first, then refresh.
 * Refreshing first would flash "workspace not found" on the page we're still showing.
 */
export async function leaveWorkspaceView(
  queryClient: QueryClient,
  navigate: UseNavigateResult<string>,
  workspaceId: string,
): Promise<void> {
  const me = queryClient.getQueryData(meQuery.queryKey);
  const next = me?.memberships.find((m) => m.workspace.id !== workspaceId);
  await (next
    ? navigate({ to: '/w/$slug', params: { slug: next.workspace.slug }, replace: true })
    : navigate({ to: '/onboarding', replace: true }));
  // Prefix match: the workspace, its members and its invitations.
  queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
  await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
}
