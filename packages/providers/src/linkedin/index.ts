import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createLinkedInLogin } from './login';
import { createLinkedInPerson } from './person';
import type { LinkedInVideoOptions } from './posts';

export { linkedinError } from './errors';
export { LINKEDIN_API, LINKEDIN_SCOPES } from './login';
export {
  LINKEDIN_MAX_CHARS,
  LINKEDIN_PREVIEW,
  LINKEDIN_RATE_LIMITS,
  LINKEDIN_RULES,
} from './person';
export {
  LINKEDIN_IMAGE_PREP,
  LINKEDIN_MAX_IMAGES,
  LINKEDIN_VERSION,
  LINKEDIN_VIDEO,
  linkedinCommentary,
  linkedinPostText,
} from './posts';

export interface LinkedInConfig {
  /** LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET: the app's OAuth 2.0 client (docs/developer-apps.md). */
  linkedin?: { clientId: string; clientSecret: string } | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
  /** How video uploads wait for LinkedIn's processing (tests make it instant). */
  videoOptions?: LinkedInVideoOptions;
}

/**
 * The LinkedIn login and networks when its keys are set; nothing otherwise. Called by core's
 * social-accounts registry in the API and the worker. The networks (profile, then company pages)
 * join this list as they're built.
 */
export function createLinkedInAdapters(config: LinkedInConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  if (!config.linkedin) return { logins: [], networks: [] };
  const http = createHttpClient({
    name: 'LinkedIn',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  return {
    logins: [createLinkedInLogin({ ...config.linkedin, http })],
    networks: [createLinkedInPerson(http, config.videoOptions)],
  };
}
