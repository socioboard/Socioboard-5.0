/** Events the media module emits; realtime (phase 2) refreshes asset cards from them. */
export interface MediaEvents extends Record<string, unknown> {
  'media.ready': { workspaceId: string; assetId: string };
  'media.failed': { workspaceId: string; assetId: string; reason: string };
  'media.deleted': { workspaceId: string; assetId: string; userId: string };
}
