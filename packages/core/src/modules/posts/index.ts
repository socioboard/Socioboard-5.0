// Public surface of the posts module (docs/backend/modules/posts.md).
export { deriveStatus, resolveContent, type ResolvedContent, type SharedContent } from './content';
export type { PostEvents } from './events';
export { registerPostListeners, registerPostRoutes } from './routes';
export { createPostService, PostIssueCode, type PostService } from './service';
