// Public surface of the media module (docs/backend/modules/media.md).
export type { MediaEvents } from './events';
export { mediaProcessQueue, processMedia, type MediaJobDeps } from './jobs';
export { analyzeImage, analyzeVideo } from './processing';
export { registerMediaRoutes } from './routes';
export { createMediaService, mediaKeys, type MediaService } from './service';
