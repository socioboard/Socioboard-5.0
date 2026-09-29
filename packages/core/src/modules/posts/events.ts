/** Events the posts module emits (audit now; realtime and notifications in phase 2). */
export interface PostEvents extends Record<string, unknown> {
  'post.created': { workspaceId: string; postId: string; userId: string };
  'post.updated': { workspaceId: string; postId: string; userId: string; fields: string[] };
  'post.deleted': { workspaceId: string; postId: string; userId: string };
  'label.created': { workspaceId: string; labelId: string; userId: string; name: string };
  'label.updated': { workspaceId: string; labelId: string; userId: string; fields: string[] };
  'label.deleted': { workspaceId: string; labelId: string; userId: string; name: string };
  /** Publish now or a retry: these targets were queued. */
  'post.publish_requested': {
    workspaceId: string;
    postId: string;
    userId: string;
    targetIds: string[];
  };
}
