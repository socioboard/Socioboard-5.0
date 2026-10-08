import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';

/**
 * Contract routes defined before their handlers, with the task that builds each. A phase's
 * contracts land first (docs/backend/contracts.md); the task that mounts a route removes it here.
 * The route checks skip only these, and fail when a listed route is already mounted.
 */
export const PENDING_ROUTES: Readonly<Record<string, string>> = {
  getShortener: 'P3-B8',
  connectShortener: 'P3-B8',
  updateShortener: 'P3-B8',
  disconnectShortener: 'P3-B8',
  shortenLink: 'P3-B8',
  submitPost: 'P4-B2',
  approvePost: 'P4-B2',
  requestChanges: 'P4-B2',
  withdrawPost: 'P4-B2',
  listPostReview: 'P4-B2',
  listReviews: 'P4-B2',
  listComments: 'P4-B3',
  createComment: 'P4-B3',
  updateComment: 'P4-B3',
  deleteComment: 'P4-B3',
  listTasks: 'P4-B5',
  createTask: 'P4-B5',
  updateTask: 'P4-B5',
  deleteTask: 'P4-B5',
  getAiStatus: 'P4-B7',
  createAiJob: 'P4-B7',
  listAiJobs: 'P4-B7',
  getAiJob: 'P4-B7',
  cancelAiJob: 'P4-B7',
  createAiUpload: 'P4-B7',
  aiResultUpdate: 'P4-B7',
};

/** Every contract route with its name (route names are unique across modules). */
export function namedRoutes(): [string, RouteDefinition][] {
  return Object.values(apiRoutes).flatMap((m) =>
    Object.entries(m as Record<string, RouteDefinition>),
  );
}
