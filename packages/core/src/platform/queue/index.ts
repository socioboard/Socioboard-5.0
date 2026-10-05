import { SpanStatusCode, trace, type Context } from '@opentelemetry/api';
import {
  DelayedError,
  Queue,
  Worker,
  type Job,
  type JobsOptions,
  type Telemetry,
  type WorkerOptions,
} from 'bullmq';
import { BullMQOtel } from 'bullmq-otel';
import { Redis } from 'ioredis';

import { runWithLogContext, type Logger } from '../logger';

export { DelayedError, type Job } from 'bullmq';
export * from './rate-limiter';

/** A queue and its processor, declared by the module that owns the work. */
export interface QueueDefinition<Data = unknown, Result = unknown> {
  name: string;
  /** `token` is the worker's lock on the job, needed to move it (e.g. `job.moveToDelayed`). */
  processor: (job: Job<Data, Result>, token?: string) => Promise<Result>;
  /** Defaults for jobs added to this queue (attempts, backoff, removeOnComplete…). */
  jobDefaults?: JobsOptions;
  /** `settings.backoffStrategy` backs jobs with `backoff: { type: 'custom' }`. */
  worker?: Pick<WorkerOptions, 'concurrency' | 'limiter' | 'lockDuration' | 'settings'>;
}

export function defineQueue<Data, Result = void>(
  name: string,
  processor: (job: Job<Data, Result>, token?: string) => Promise<Result>,
  options: Omit<QueueDefinition<Data, Result>, 'name' | 'processor'> = {},
): QueueDefinition<Data, Result> {
  return { name, processor, ...options };
}

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5_000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

export interface Queues {
  /** Producer side (api and worker): the Queue for a definition, created once. */
  get<Data, Result>(def: QueueDefinition<Data, Result>): Queue<Data, Result>;
  /** Consumer side (worker only): start processing a definition's jobs. */
  startWorker<Data, Result>(def: QueueDefinition<Data, Result>): Worker<Data, Result>;
  /** Names of the queues this process started workers for. */
  workerNames(): string[];
  /** Valkey/Redis reachable (health endpoint). */
  ping(): Promise<boolean>;
  /** Stops workers (waiting for active jobs up to the timeout), then closes queues. */
  close(timeoutMs?: number): Promise<void>;
}

export interface CreateQueuesOptions {
  /** REDIS_URL: Valkey or Redis, same protocol. */
  url: string;
  logger: Logger;
  /** Key prefix, so several installs or test runs can share one Valkey. */
  prefix?: string;
  /**
   * OpenTelemetry on: jobs carry the trace of whoever queued them (an API request), and each
   * run is a span with its job metrics (docs/infra.md#observability).
   */
  telemetry?: boolean;
}

/**
 * BullMQ's spans, minus event attributes that have no value. A job that returns nothing gets a
 * "job completed" event with `bullmq.job.result: undefined`, which the OTLP/JSON exporter writes as
 * an empty value; OpenObserve then refuses the whole batch (400), losing every span in it. Checked
 * on 2026-10-05: worker job spans never arrived until this.
 */
export function withoutEmptyEventValues(otel: BullMQOtel): Telemetry<Context> {
  return {
    contextManager: otel.contextManager,
    ...(otel.meter ? { meter: otel.meter } : {}),
    tracer: {
      startSpan(name, options, ctx) {
        const span = otel.tracer.startSpan(name, options, ctx);
        const addEvent = span.addEvent.bind(span);
        span.addEvent = (event, attributes) => {
          addEvent(
            event,
            attributes &&
              Object.fromEntries(Object.entries(attributes).filter(([, v]) => v !== undefined)),
          );
        };
        return span;
      },
    },
  };
}

/**
 * A job that threw, recorded on its span (BullMQ only adds a "job failed" event). Moving a job
 * back to delayed (rate limits) is how a processor waits, not a failure.
 */
function recordJobError(err: unknown): void {
  if (err instanceof DelayedError) return;
  const span = trace.getActiveSpan();
  if (!span) return;
  span.recordException(err instanceof Error ? err : String(err));
  span.setStatus({ code: SpanStatusCode.ERROR });
}

export function createQueues({
  url,
  logger,
  prefix = 'sb',
  telemetry: traced = false,
}: CreateQueuesOptions): Queues {
  // Workers use blocking commands, so BullMQ needs maxRetriesPerRequest: null.
  const connection = { url, maxRetriesPerRequest: null };
  const telemetry: { telemetry?: Telemetry } = traced
    ? {
        telemetry: withoutEmptyEventValues(
          new BullMQOtel({
            tracerName: 'socioboard-queues',
            meterName: 'socioboard-queues',
            enableMetrics: true,
          }),
        ),
      }
    : {};
  const queues = new Map<string, Queue>();
  const workers: Worker[] = [];
  let healthClient: Redis | undefined;

  const get = <Data, Result>(def: QueueDefinition<Data, Result>): Queue<Data, Result> => {
    let q = queues.get(def.name);
    if (!q) {
      q = new Queue(def.name, {
        connection,
        prefix,
        ...telemetry,
        defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...def.jobDefaults },
      });
      queues.set(def.name, q);
    }
    return q as unknown as Queue<Data, Result>;
  };

  return {
    get,

    startWorker<Data, Result>(def: QueueDefinition<Data, Result>) {
      const worker = new Worker(
        def.name,
        (job: Job<Data, Result>, token?: string) =>
          runWithLogContext({ queue: def.name, ...(job.id ? { jobId: job.id } : {}) }, () =>
            def.processor(job, token).catch((err: unknown) => {
              recordJobError(err);
              throw err;
            }),
          ),
        { connection, prefix, concurrency: 5, ...telemetry, ...def.worker },
      );
      worker.on('failed', (job, err) => {
        logger.warn(
          { err, queue: def.name, jobId: job?.id, attempts: job?.attemptsMade },
          'job failed',
        );
      });
      worker.on('error', (err) => {
        logger.error({ err, queue: def.name }, 'worker error');
      });
      workers.push(worker as Worker);
      return worker;
    },

    workerNames: () => workers.map((w) => w.name),

    async ping() {
      healthClient ??= new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
      try {
        await healthClient.ping();
        return true;
      } catch {
        return false;
      }
    },

    async close(timeoutMs = 30_000) {
      const stopWorkers = Promise.all(workers.map((w) => w.close()));
      const timeout = new Promise<'timeout'>((resolve) =>
        setTimeout(() => {
          resolve('timeout');
        }, timeoutMs).unref(),
      );
      if ((await Promise.race([stopWorkers, timeout])) === 'timeout') {
        // BullMQ's close(true) returns the close already in progress, so it cannot cut a
        // running job short. Stop waiting instead: once the process exits, the job's lock
        // expires and BullMQ hands it to another worker as a stalled job.
        logger.warn({ timeoutMs }, 'active jobs still running at shutdown; they will be retried');
      }
      await Promise.all([...queues.values()].map((q) => q.close()));
      healthClient?.disconnect();
    },
  };
}
