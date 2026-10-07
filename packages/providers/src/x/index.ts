import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createXLogin } from './login';
import { createX, type XOptions } from './x';

export { xError } from './errors';
export { X_API, X_SCOPES } from './login';
export {
  X_IMAGE_PREP,
  X_LINK_POST_COST_USD,
  X_MAX_CHARS,
  X_POST_COST_USD,
  X_PREVIEW,
  X_RATE_LIMITS,
  X_RULES,
  XIssueCode,
  xPostText,
  xTextLength,
} from './x';

export interface XConfig {
  /** X_CLIENT_ID / X_CLIENT_SECRET: the app's OAuth 2.0 client (docs/developer-apps.md). */
  x?: { clientId: string; clientSecret: string } | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
  /** Video processing polling (tests make it instant). */
  xOptions?: XOptions;
}

/** The X login and network when its keys are set; nothing otherwise. */
export function createXAdapters(config: XConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  if (!config.x) return { logins: [], networks: [] };
  const http = createHttpClient({
    name: 'X',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  return {
    logins: [createXLogin({ ...config.x, http })],
    networks: [createX(http, config.xOptions)],
  };
}
