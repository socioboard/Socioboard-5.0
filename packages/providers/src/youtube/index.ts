import { createHttpClient, type ProviderLogger } from '../http';
import type { LoginAdapter, NetworkAdapter } from '../types';
import { createYouTubeLogin } from './login';
import { createYouTube } from './youtube';

export { youtubeError } from './errors';
export {
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_OAUTH_TOKEN_URL,
  YOUTUBE_API,
  YOUTUBE_SCOPES,
} from './login';
export {
  YOUTUBE_MAX_DESC_CHARS,
  YOUTUBE_MAX_TAGS_CHARS,
  YOUTUBE_MAX_TITLE_CHARS,
  YOUTUBE_PREVIEW,
  YOUTUBE_RATE_LIMITS,
  YOUTUBE_RULES,
  YouTubeIssueCode,
} from './youtube';

export interface YouTubeConfig {
  /** YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET: Google OAuth 2.0 credentials. */
  youtube?: { clientId: string; clientSecret: string } | undefined;
  fetch?: typeof fetch;
  logger?: ProviderLogger;
}

/** The YouTube login and network when its keys are set; empty otherwise. */
export function createYouTubeAdapters(config: YouTubeConfig): {
  logins: LoginAdapter[];
  networks: NetworkAdapter[];
} {
  if (!config.youtube) return { logins: [], networks: [] };

  const http = createHttpClient({
    name: 'YouTube',
    ...(config.fetch ? { fetch: config.fetch } : {}),
    ...(config.logger ? { logger: config.logger } : {}),
  });

  return {
    logins: [createYouTubeLogin({ ...config.youtube, http })],
    networks: [createYouTube(http)],
  };
}
