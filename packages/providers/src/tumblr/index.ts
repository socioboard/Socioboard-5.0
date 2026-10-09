import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createTumblrLogin } from './login';
import { createTumblrNetwork } from './tumblr';

export { tumblrError } from './errors';
export { TUMBLR_API, TUMBLR_AUTH_URL, TUMBLR_SCOPES } from './login';
export {
  TUMBLR_CAPABILITIES,
  TUMBLR_IMAGE_PREP,
  TUMBLR_MAX_CHARS,
  TUMBLR_PREVIEW,
  TUMBLR_RATE_LIMITS,
  TUMBLR_RULES,
} from './tumblr';

export interface TumblrConfig {
  tumblr?: { clientId: string; clientSecret: string } | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
}

/** The Tumblr login and network when its keys are set; nothing otherwise. */
export function createTumblrAdapters(config: TumblrConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  if (!config.tumblr) return { logins: [], networks: [] };
  const http = createHttpClient({
    name: 'Tumblr',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  return {
    logins: [createTumblrLogin({ ...config.tumblr, http })],
    networks: [createTumblrNetwork({ http })],
  };
}
