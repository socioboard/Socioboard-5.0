// Public surface of the admin module (docs/backend/modules/admin.md).
export { BULL_BOARD_PATH, createBullBoardRouter, createQueueCounts, WORKER_QUEUES } from './queues';
export { registerAdminRoutes } from './routes';
export { createAdminService, type AdminService, type AdminServiceDeps } from './service';
