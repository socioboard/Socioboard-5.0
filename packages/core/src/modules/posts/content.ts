import type {
  PostStatus,
  TargetOptions,
  TargetOverride,
  TargetStatus,
} from '@socioboard/contracts';

/** The shared content of a post, as stored. */
export interface SharedContent {
  text: string;
  mediaIds: string[];
  link: string | null;
  firstComment: string | null;
}

/** What one target publishes: the shared content with the target's override on top. */
export interface ResolvedContent extends SharedContent {
  options: TargetOptions;
}

/**
 * Base content + override → the final content for one network (docs/backend/modules/posts.md,
 * resolveContent). An override field that is set replaces the shared one, even when empty.
 */
export function resolveContent(
  post: SharedContent,
  override: TargetOverride | null,
): ResolvedContent {
  return {
    text: override?.text ?? post.text,
    mediaIds: override?.mediaIds ?? post.mediaIds,
    link: post.link,
    firstComment: post.firstComment,
    options: override?.options ?? {},
  };
}

/** Statuses a person sets (draft, review, approval); the rest follow from the targets. */
const EDITORIAL: readonly PostStatus[] = ['draft', 'in_review', 'approved'];

/**
 * The post's status from its targets (recomputeStatus). Cancelled targets don't count.
 * - any target publishing, or some done while others still wait → publishing
 * - all done: all published → published; all failed → failed; a mix → partial
 * - all waiting and scheduled → scheduled (phase 2)
 * - nothing sent yet → the editorial status it had (draft, in review, approved)
 */
export function deriveStatus(current: PostStatus, targets: { status: TargetStatus }[]): PostStatus {
  const live = targets.filter((t) => t.status !== 'cancelled');
  const count = (s: TargetStatus) => live.filter((t) => t.status === s).length;
  const published = count('published');
  const failed = count('failed');
  const waiting = count('pending') + count('scheduled');
  const done = published + failed;

  if (count('publishing') > 0) return 'publishing';
  if (done > 0 && waiting > 0) return 'publishing';
  if (done > 0) {
    if (failed === 0) return 'published';
    return published === 0 ? 'failed' : 'partial';
  }
  if (live.length > 0 && count('scheduled') === live.length) return 'scheduled';
  return EDITORIAL.includes(current) ? current : 'draft';
}

/** Target states that can no longer be edited, removed or deleted with the post. */
export const LOCKED_TARGET: readonly TargetStatus[] = ['publishing', 'published'];
