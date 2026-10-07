import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createFacebookLogin } from './facebook-login';
import { createFacebookPage } from './facebook-page';
import { createGraphClient } from './graph-client';
import { createInstagram, type InstagramOptions } from './instagram';
import { createInstagramLogin } from './instagram-login';
import {
  createThreads,
  createThreadsLogin,
  THREADS_API,
  THREADS_API_VERSION,
  type ThreadsOptions,
} from './threads';

export { classifyGraphError, DEFAULT_GRAPH_VERSION } from './graph-client';
export { FACEBOOK_SCOPES } from './facebook-login';
export {
  FACEBOOK_IMAGE_PREP,
  FACEBOOK_PREVIEW,
  FACEBOOK_RATE_LIMITS,
  FACEBOOK_RULES,
} from './facebook-page';
export { INSTAGRAM_SCOPES } from './instagram-login';
export {
  THREADS_IMAGE_PREP,
  THREADS_PREVIEW,
  THREADS_RATE_LIMITS,
  THREADS_RULES,
  THREADS_SCOPES,
  threadsTextLength,
} from './threads';
export {
  INSTAGRAM_IMAGE_PREP,
  INSTAGRAM_PREVIEW,
  INSTAGRAM_RATE_LIMITS,
  INSTAGRAM_RULES,
} from './instagram';

export interface MetaConfig {
  /** META_APP_ID / META_APP_SECRET: the Facebook Login for Business app. */
  facebook?: { appId: string; appSecret: string; configId?: string | undefined } | undefined;
  /** INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET: Instagram Login (same Meta app, its own id). */
  instagram?: { appId: string; appSecret: string } | undefined;
  /** THREADS_APP_ID / THREADS_APP_SECRET: the Threads use case (same Meta app, its own id). */
  threads?: { appId: string; appSecret: string } | undefined;
  /** META_GRAPH_VERSION, default DEFAULT_GRAPH_VERSION. */
  version?: string | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
  /** Container polling (tests make it instant). */
  instagramOptions?: InstagramOptions;
  /** Threads container polling (tests make it instant). */
  threadsOptions?: ThreadsOptions;
}

/**
 * The Meta logins and networks whose keys are set; the rest stay off. Facebook Login reaches
 * Pages and their linked Instagram accounts; Instagram Login reaches Instagram accounts alone.
 */
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

  const facebookGraph = config.facebook
    ? createGraphClient({ http, appSecret: config.facebook.appSecret, version: config.version })
    : undefined;
  const instagramGraph = config.instagram
    ? createGraphClient({
        http,
        appSecret: config.instagram.appSecret,
        version: config.version,
        baseUrl: 'https://graph.instagram.com',
        proof: false,
      })
    : undefined;

  if (config.facebook && facebookGraph) {
    logins.push(
      createFacebookLogin({
        ...config.facebook,
        version: config.version,
        http,
        graph: facebookGraph,
      }),
    );
    networks.push(createFacebookPage(facebookGraph));
  }
  if (config.instagram && instagramGraph) {
    logins.push(createInstagramLogin({ ...config.instagram, http, graph: instagramGraph }));
  }
  if (facebookGraph || instagramGraph) {
    networks.push(
      createInstagram(
        { facebook: facebookGraph, instagram: instagramGraph },
        config.instagramOptions,
      ),
    );
  }
  if (config.threads) {
    const threadsGraph = createGraphClient({
      http,
      appSecret: config.threads.appSecret,
      version: THREADS_API_VERSION,
      baseUrl: THREADS_API,
      proof: false,
    });
    logins.push(createThreadsLogin({ ...config.threads, http, graph: threadsGraph }));
    networks.push(createThreads(threadsGraph, config.threadsOptions));
  }
  return { logins, networks };
}
