import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createPinterestLogin, PINTEREST_API, PINTEREST_SANDBOX_API } from './login';
import type { PinterestVideoOptions } from './media';
import { createPinterestPins } from './pins';

export { pinterestError } from './errors';
export { PINTEREST_API, PINTEREST_SANDBOX_API, PINTEREST_SCOPES } from './login';
export {
  PINTEREST_VIDEO,
  PINTEREST_VIDEO_MIMES,
  PINTEREST_VIDEO_WAIT,
  type PinterestVideoOptions,
} from './media';
export {
  PINTEREST_IMAGE_PREP,
  PINTEREST_MAX_ALT_TEXT,
  PINTEREST_MAX_CHARS,
  PINTEREST_MAX_IMAGES,
  PINTEREST_MAX_TITLE,
  PINTEREST_PREVIEW,
  PINTEREST_RATE_LIMITS,
  PINTEREST_RULES,
  PinterestIssueCode,
} from './pins';

export interface PinterestConfig {
  /** PINTEREST_CLIENT_ID / PINTEREST_CLIENT_SECRET: the app's OAuth client (docs/developer-apps.md). */
  pinterest?: { clientId: string; clientSecret: string } | undefined;
  /**
   * Use Pinterest's sandbox API: apps with Trial access can only create pins there (visible only
   * to their creator), and sandbox tokens come from the sandbox's own token endpoint.
   */
  sandbox?: boolean;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
  /** How video uploads wait for Pinterest's processing (tests make it instant). */
  videoOptions?: PinterestVideoOptions;
}

/**
 * The Pinterest login and network when its keys are set; nothing otherwise. Called by core's
 * social-accounts registry in the API and the worker. Both use the same API host, so a sandbox
 * token is only ever sent to the sandbox.
 */
export function createPinterestAdapters(config: PinterestConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  if (!config.pinterest) return { logins: [], networks: [] };
  const http = createHttpClient({
    name: 'Pinterest',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  const api = config.sandbox ? PINTEREST_SANDBOX_API : PINTEREST_API;
  return {
    logins: [createPinterestLogin({ ...config.pinterest, http, api })],
    networks: [createPinterestPins(http, api, config.videoOptions)],
  };
}
