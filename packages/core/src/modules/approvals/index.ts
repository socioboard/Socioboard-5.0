// Public surface of the approvals module (docs/backend/modules/approvals.md).
export { createCommentService, type CommentService, type CommentServiceDeps } from './comments';
export { registerApprovalRoutes } from './routes';
export { createApprovalService, type ApprovalService, type ApprovalServiceDeps } from './service';
