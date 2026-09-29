// Public surface of the social-accounts module (docs/backend/modules/social-accounts.md).
export type { SocialAccountEvents } from './events';
export { createNetworkRegistry } from './registry';
export { createOAuthCallbackRouter, registerSocialAccountRoutes } from './routes';
export { createSocialAccountService, type SocialAccountService } from './service';
