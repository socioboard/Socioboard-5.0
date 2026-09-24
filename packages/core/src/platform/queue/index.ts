import { Queue, Worker, type Job, type JobsOptions, type WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';

import { runWithLogContext, type Logger } from '../logger';

export type { Job } from 'bullmq';

/** A queue and its processor, declared by the module that owns the work. */
export interface QueueDefinition<Data = unknown, Result = unknown> {
  name: string;
  processor: (job: Job<Data, Result>) => Promise<Result>;
  /** Defaults for jobs added to this queue (attempts, backoff, removeOnComplete…). */
  jobDefaults?: JobsOptions;
  worker?: Pick<WorkerOptions, 'concurrency' | 'limiter' | 'lockDuration'>;
}

export function defineQueue<Data, Result = void>(
  name: string,
  processor: (job: Job<Data, Result>) => Promise<Result>,
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
}

export function createQueues({ url, logger, prefix = 'sb' }: CreateQueuesOptions): Queues {
  // Workers use blocking commands, so BullMQ needs maxRetriesPerRequest: null.
  const connection = { url, maxRetriesPerRequest: null };
  const queues = new Map<string, Queue>();
  const workers: Worker[] = [];
  let healthClient: Redis | undefined;

  const get = <Data, Result>(def: QueueDefinition<Data, Result>): Queue<Data, Result> => {
    let q = queues.get(def.name);
    if (!q) {
      q = new Queue(def.name, {
        connection,
        prefix,
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
        (job: Job<Data, Result>) =>
          runWithLogContext({ queue: def.name, ...(job.id ? { jobId: job.id } : {}) }, () =>
            def.processor(job),
          ),
        { connection, prefix, concurrency: 5, ...def.worker },
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
        logger.warn('workers did not finish active jobs in time; forcing close');
        await Promise.all(workers.map((w) => w.close(true)));
      }
      await Promise.all([...queues.values()].map((q) => q.close()));
      healthClient?.disconnect();
    },
  };
}
