import { existsSync } from 'node:fs';

// Integration tests store files in the dev compose's local S3 (RustFS, `COMPOSE_PROFILES=local-s3`), never in
// the S3 bucket a developer's .env points at: they're fast and local, and test files don't land
// in real storage. Set S3_BUCKET yourself to choose otherwise (an empty value turns storage off,
// as CI's "storage off" run does). Values already in the environment win over these and .env.
if (process.env.S3_BUCKET === undefined) {
  Object.assign(process.env, {
    S3_ENDPOINT: 'http://localhost:9000',
    S3_BUCKET: 'socioboard-media',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY_ID: 'socioboard',
    S3_SECRET_ACCESS_KEY: 'socioboard-dev-secret',
    S3_FORCE_PATH_STYLE: 'true',
    // A .env set to the NAS (staging's setup) would otherwise win and 5 files fail to load.
    STORAGE_DRIVER: 's3',
    // The .env's CDN or tunnel serves the real bucket, not the local one.
    STORAGE_PUBLIC_URL: '',
    MEDIA_PUBLIC_URL: '',
  });
}

const rootEnv = new URL('../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
