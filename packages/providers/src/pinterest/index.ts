import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createPinterestLogin, PINTEREST_API, PINTEREST_SANDBOX_API } from './login';

export { pinterestError } from './errors';
export { PINTEREST_API, PINTEREST_SANDBOX_API, PINTEREST_SCOPES } from './login';

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
}

/**
 * The Pinterest login and network when its keys are set; nothing otherwise. Called by core's
 * social-accounts registry in the API and the worker. Until the `pinterest` network joins this
 * list the registry keeps Pinterest disabled (a network needs its adapter and a login).
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
    networks: [],
  };
}
