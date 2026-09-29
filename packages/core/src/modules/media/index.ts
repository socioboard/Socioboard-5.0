// Public surface of the media module (docs/backend/modules/media.md).
export type { MediaEvents } from './events';
export { mediaProcessQueue, processMedia, type MediaJobDeps } from './jobs';
export { analyzeImage, analyzeVideo } from './processing';
export { registerMediaRoutes } from './routes';
export { createMediaService, mediaKeys, type MediaService } from './service';
export {
  createMediaUrlSigner,
  createPublicMediaRouter,
  PUBLIC_MEDIA_TTL_SEC,
  type MediaUrlSigner,
} from './public-media';
export {
  ABANDONED_UPLOAD_HOURS,
  DELETED_MEDIA_RETENTION_DAYS,
  mediaPurgeQueue,
  purgeMedia,
  type MediaPurgeDeps,
} from './purge';
export { prepareImageVariant, type ImageSpec, type StoredImage } from './variants';
