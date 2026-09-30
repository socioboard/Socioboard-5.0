import { apiRoutes, type LabelColor, type PostLabel } from '@socioboard/contracts';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { postKeys } from './api';

/** The workspace's labels, by name (docs/backend/modules/posts.md, labels). */
export const labelsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: [...postKeys.all(workspaceId), 'labels'] as const,
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.posts.listLabels, { params: { workspaceId }, signal })).items,
  });

export function createLabel(workspaceId: string, body: { name: string; color: LabelColor }) {
  return api(apiRoutes.posts.createLabel, { params: { workspaceId }, body });
}

export function updateLabel(
  workspaceId: string,
  labelId: string,
  body: { name?: string; color?: LabelColor },
) {
  return api(apiRoutes.posts.updateLabel, { params: { workspaceId, labelId }, body });
}

export function deleteLabel(workspaceId: string, labelId: string) {
  return api(apiRoutes.posts.deleteLabel, { params: { workspaceId, labelId } });
}

/**
 * After a label changed: its list, and every post screen (rows and details show labels, and a
 * deleted one is taken off every post).
 */
export function refreshLabels(queryClient: QueryClient, workspaceId: string) {
  return queryClient.invalidateQueries({ queryKey: postKeys.all(workspaceId) });
}

/** A post's label ids as labels, in the workspace's order; ids no longer known are skipped. */
export function labelsOf(ids: readonly string[], labels: readonly PostLabel[] | undefined) {
  if (!labels) return [];
  return labels.filter((l) => ids.includes(l.id));
}

/** Colours offered for a new label, in turn, so a fresh list isn't all one colour. */
export const NEXT_COLORS: LabelColor[] = [
  'blue',
  'green',
  'orange',
  'violet',
  'teal',
  'pink',
  'amber',
  'indigo',
  'red',
  'gray',
];
