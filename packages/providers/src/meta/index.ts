import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createFacebookLogin } from './facebook-login';
import { createFacebookPage } from './facebook-page';
import { createGraphClient } from './graph-client';

export { classifyGraphError, DEFAULT_GRAPH_VERSION } from './graph-client';
export { FACEBOOK_SCOPES } from './facebook-login';
export { FACEBOOK_PREVIEW, FACEBOOK_RULES } from './facebook-page';

export interface MetaConfig {
  /** META_APP_ID / META_APP_SECRET: the Facebook Login for Business app. */
  facebook?: { appId: string; appSecret: string; configId?: string | undefined } | undefined;
  /** META_GRAPH_VERSION, default DEFAULT_GRAPH_VERSION. */
  version?: string | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
}

/** The Meta logins and networks whose keys are set; the rest stay off. */
export function createMetaAdapters(config: MetaConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  const http = createHttpClient({
    name: 'Meta',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });
  const logins: LoginAdapter[] = [];
  const networks: NetworkAdapter[] = [];
  if (config.facebook) {
    const graph = createGraphClient({
      http,
      appSecret: config.facebook.appSecret,
      version: config.version,
    });
    logins.push(createFacebookLogin({ ...config.facebook, version: config.version, http, graph }));
    networks.push(createFacebookPage(graph));
  }
  return { logins, networks };
}
