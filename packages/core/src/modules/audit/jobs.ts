import { defineQueue, type Logger } from '../../platform';
import type { AuditLog } from './service';

/** audit-purge: nightly, deletes entries older than AUDIT_RETENTION_DAYS. */
export const auditPurgeQueue = (deps: { audit: AuditLog; retentionDays: number; logger: Logger }) =>
  defineQueue<Record<string, never>, number>(
    'audit-purge',
    async () => {
      const removed = await deps.audit.purgeExpired(deps.retentionDays);
      if (removed > 0) deps.logger.info({ removed }, 'expired audit entries deleted');
      return removed;
    },
    { worker: { concurrency: 1 } },
  );
