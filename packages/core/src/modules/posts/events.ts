/** Events the posts module emits (audit now; realtime and notifications in phase 2). */
export interface PostEvents extends Record<string, unknown> {
  'post.created': { workspaceId: string; postId: string; userId: string };
  'post.updated': { workspaceId: string; postId: string; userId: string; fields: string[] };
  'post.deleted': { workspaceId: string; postId: string; userId: string };
}
