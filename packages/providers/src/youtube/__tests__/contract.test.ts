// P3-B3: the YouTube adapters against the provider contract.
import {
  describeContractCoverage,
  describeLoginContract,
  describeNetworkContract,
  withReplay,
} from '../../testing/contract';
import { fixture } from '../../testing/replay';
import type { PublishInput, PublishMedia } from '../../types';
import { createYouTubeAdapters } from '../index';

const tokens = {
  accessToken: 'ya29.youtube-access-token',
  refreshToken: '1//youtube-refresh-token',
  expiresAt: null,
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ],
};

const youtube = (fetch: typeof globalThis.fetch) =>
  createYouTubeAdapters({
    youtube: { clientId: 'yt-client-id', clientSecret: 'yt-client-secret' },
    fetch,
  });

describeLoginContract(
  'YouTube login',
  withReplay((fetch) => {
    const [login] = youtube(fetch).logins;
    if (!login) throw new Error('youtube login missing');
    return login;
  }),
  {
    tokens,
    identity: fixture('youtube', 'channel'),
    assets: fixture('youtube', 'channel'),
    invalidToken: fixture('youtube', 'error-invalid-token'),
  },
);

const video: PublishMedia = {
  id: 'yt-v1',
  kind: 'video',
  mime: 'video/mp4',
  sizeBytes: 102400,
  width: 1920,
  height: 1080,
  durationSec: 60,
  altText: null,
  readUrl: 'https://storage.test/video.mp4',
  publicUrl: 'https://media.test/video.mp4',
};

const postWithVideo: PublishInput = {
  text: 'Fresh roast today',
  media: [video],
  link: null,
  firstComment: null,
  options: {
    youtube: {
      title: 'Fresh roast today',
      privacy: 'private',
      tags: ['coffee', 'roast'],
      madeForKids: false,
    },
  },
};

describeNetworkContract(
  'YouTube',
  withReplay((fetch) => {
    const [network] = youtube(fetch).networks;
    if (!network) throw new Error('youtube network missing');
    return network;
  }),
  {
    account: {
      externalId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
      accessToken: 'ya29.youtube-access-token',
      meta: { customUrl: '@haldencoffee' },
    },
    input: postWithVideo,
    publish: fixture('youtube', 'video-created'),
    errors: {
      auth: fixture('youtube', 'error-expired-token'),
      rate_limited: fixture('youtube', 'error-rate-limit'),
      content: fixture('youtube', 'error-content'),
      retryable: fixture('youtube', 'error-server'),
    },
  },
);

describeContractCoverage(
  'YouTube',
  youtube(() => Promise.reject(new Error('no calls here'))),
);
