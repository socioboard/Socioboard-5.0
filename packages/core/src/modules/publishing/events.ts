import type { NetworkId, PublishErrorKind } from '@socioboard/contracts';

/** Events the publishing worker emits (realtime and notifications listen from phase 2). */
export interface PublishingEvents extends Record<string, unknown> {
  'target.published': {
    workspaceId: string;
    postId: string;
    targetId: string;
    network: NetworkId;
    externalPostId: string;
  };
  /** After the last attempt: the target stays failed until someone retries it. */
  'target.failed': {
    workspaceId: string;
    postId: string;
    targetId: string;
    network: NetworkId;
    errorKind: PublishErrorKind;
    message: string;
  };
}
