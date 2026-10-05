// Public surface of the admin module (docs/backend/modules/admin.md).
export {
  createOpsAlerts,
  opsAlertsFor,
  ALERT_CHECK_MS,
  type OpsAlert,
  type OpsAlertKind,
  type OpsAlerts,
  type OpsAlertsDeps,
} from './alerts';
export {
  BULL_BOARD_PATH,
  createBullBoardRouter,
  createQueueCounts,
  observeQueueDepth,
  WORKER_QUEUES,
} from './queues';
export { registerAdminRoutes } from './routes';
export { createAdminService, type AdminService, type AdminServiceDeps } from './service';
