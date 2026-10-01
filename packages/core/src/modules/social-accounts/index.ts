// Public surface of the social-accounts module (docs/backend/modules/social-accounts.md).
export type { SocialAccountEvents } from './events';
export { accountHealthQueue, tokenRefreshQueue } from './jobs';
export { createNetworkRegistry } from './registry';
export { createOAuthCallbackRouter, registerSocialAccountRoutes } from './routes';
export {
  createSocialAccountService,
  HEALTH_CHECK_EVERY_HOURS,
  TOKEN_REFRESH_AHEAD_HOURS,
  type SocialAccountService,
} from './service';
