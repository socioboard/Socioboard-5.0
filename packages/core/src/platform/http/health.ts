import { Router } from 'express';

export type CheckStatus = 'ok' | 'down' | 'disabled';

export interface HealthReport {
  /** ok: all good · degraded: an optional service (storage) is down · down: not serving. */
  status: 'ok' | 'degraded' | 'down';
  checks: { db: CheckStatus; valkey: CheckStatus; storage: CheckStatus };
}

export interface HealthDeps {
  db: { ping(): Promise<boolean> };
  queues: { ping(): Promise<boolean> };
  /** Undefined when S3/MinIO isn't configured. */
  storage: { ping(): Promise<boolean> } | undefined;
  /** Per check; a hung dependency counts as down instead of hanging the probe. */
  timeoutMs?: number;
  /** Results are reused this long, so frequent or hostile probes don't load Postgres or S3. */
  cacheMs?: number;
  now?: () => number;
}

export interface Health {
  /**
   * GET /api/health: readiness, with dependency checks. 200 when the API can serve (storage down
   * only disables media: "degraded"), 503 when Postgres or Valkey is down or it is shutting down,
   * so a load balancer stops sending traffic.
   * GET /api/health/live: liveness, no dependencies: 200 while the process can answer at all.
   */
  router: Router;
  check(): Promise<HealthReport>;
  /** Called at shutdown: readiness turns 503 so the load balancer drains this instance. */
  markShuttingDown(): void;
}

async function probe(ping: () => Promise<boolean>, timeoutMs: number): Promise<CheckStatus> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<false>((resolve) => {
    timer = setTimeout(() => {
      resolve(false);
    }, timeoutMs);
  });
  try {
    return (await Promise.race([ping().catch(() => false), timeout])) ? 'ok' : 'down';
  } finally {
    clearTimeout(timer);
  }
}

export function createHealth({
  db,
  queues,
  storage,
  timeoutMs = 2_000,
  cacheMs = 5_000,
  now = Date.now,
}: HealthDeps): Health {
  let shuttingDown = false;
  let cached: { at: number; report: Promise<HealthReport> } | undefined;

  async function run(): Promise<HealthReport> {
    const [dbStatus, valkey, storageStatus] = await Promise.all([
      probe(() => db.ping(), timeoutMs),
      probe(() => queues.ping(), timeoutMs),
      storage ? probe(() => storage.ping(), timeoutMs) : Promise.resolve('disabled' as const),
    ]);
    const checks = { db: dbStatus, valkey, storage: storageStatus };
    const status =
      dbStatus === 'down' || valkey === 'down'
        ? 'down'
        : storageStatus === 'down'
          ? 'degraded'
          : 'ok';
    return { status, checks };
  }

  function check(): Promise<HealthReport> {
    // Concurrent probes share one run; a finished run is reused for cacheMs.
    if (!cached || now() - cached.at >= cacheMs) cached = { at: now(), report: run() };
    return cached.report;
  }

  const router = Router();
  router.get('/api/health/live', (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: 'ok' });
  });
  router.get('/api/health', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const report = await check();
    if (shuttingDown) {
      res.status(503).json({ ...report, status: 'down', shuttingDown: true });
      return;
    }
    res.status(report.status === 'down' ? 503 : 200).json(report);
  });

  return {
    router,
    check,
    markShuttingDown: () => {
      shuttingDown = true;
    },
  };
}
