import { defineQueue } from '../../platform';
import type { SocialAccountService } from './service';

/** `token-refresh` (hourly): renew tokens before they expire (social-accounts.md, Jobs). */
export const tokenRefreshQueue = (accounts: SocialAccountService) =>
  defineQueue('token-refresh', async () => {
    await accounts.refreshExpiringTokens();
  });

/** `account-health` (daily): check every login can still post to its accounts. */
export const accountHealthQueue = (accounts: SocialAccountService) =>
  defineQueue('account-health', async () => {
    await accounts.checkHealth();
  });
