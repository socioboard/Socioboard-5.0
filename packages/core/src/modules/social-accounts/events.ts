import type { LoginProvider, NetworkId } from '@socioboard/contracts';

/** Events the social-accounts module emits (audit now; notifications in phase 2). */
export interface SocialAccountEvents extends Record<string, unknown> {
  'connection.added': {
    workspaceId: string;
    connectionId: string;
    provider: LoginProvider;
    userId: string;
  };
  'connection.removed': {
    workspaceId: string;
    connectionId: string;
    provider: LoginProvider;
    userId: string;
  };
  'account.connected': {
    workspaceId: string;
    accountId: string;
    network: NetworkId;
    connectionId: string;
    userId: string;
  };
  /**
   * The account stops posting; its pending deliveries were cancelled (`cancelledTargetIds`). The
   * posts module recomputes those posts' status from this event.
   */
  'account.disconnected': {
    workspaceId: string;
    accountId: string;
    network: NetworkId;
    userId: string;
    cancelledTargetIds: string[];
  };
  /** The network refused the tokens; someone needs to reconnect the login. */
  'account.reauth_required': {
    workspaceId: string;
    accountId: string;
    connectionId: string;
    reason: string;
  };
}
