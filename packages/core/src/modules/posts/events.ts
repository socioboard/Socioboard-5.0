/** Events the posts module emits (audit now; realtime and notifications in phase 2). */
export interface PostEvents extends Record<string, unknown> {
  'post.created': { workspaceId: string; postId: string; userId: string };
  'post.updated': { workspaceId: string; postId: string; userId: string; fields: string[] };
  'post.deleted': {
    workspaceId: string;
    postId: string;
    userId: string;
    /** Set when the post was a repeating post's template: its rule, deleted with it. */
    templateOfRuleId: string | null;
  };
  'label.created': { workspaceId: string; labelId: string; userId: string; name: string };
  'label.updated': { workspaceId: string; labelId: string; userId: string; fields: string[] };
  'label.deleted': { workspaceId: string; labelId: string; userId: string; name: string };
  /**
   * Review steps (P4-B2, docs/backend/modules/approvals.md). `submitted` also follows an edit
   * that reset an approval (`afterEdit`).
   */
  'post.submitted': {
    workspaceId: string;
    postId: string;
    userId: string;
    authorId: string | null;
    note: string | null;
    afterEdit: boolean;
  };
  'post.approved': {
    workspaceId: string;
    postId: string;
    userId: string;
    authorId: string | null;
    note: string | null;
  };
  'post.changes_requested': {
    workspaceId: string;
    postId: string;
    userId: string;
    authorId: string | null;
    note: string;
  };
  'post.withdrawn': { workspaceId: string; postId: string; userId: string };
  /** Publish now or a retry: these targets were queued. */
  'post.publish_requested': {
    workspaceId: string;
    postId: string;
    userId: string;
    targetIds: string[];
  };
}
