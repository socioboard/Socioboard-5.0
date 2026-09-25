import { createPrismaClient, type PrismaClient } from '@socioboard/db';

export type { PrismaClient } from '@socioboard/db';

export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantScopeError';
  }
}

type Args = Record<string, unknown>;

interface QueryHookParams {
  model: string;
  operation: string;
  args: Args | undefined;
  query: (args: Args | undefined) => Promise<unknown>;
}

const WHERE_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'updateManyAndReturn',
  'deleteMany',
]);
const UNIQUE_WHERE_OPS = new Set(['findUnique', 'findUniqueOrThrow', 'update', 'delete']);
const CREATE_MANY_OPS = new Set(['createMany', 'createManyAndReturn']);

/** Prisma's nested relation operations inside `data`. */
const RELATION_OPS = new Set([
  'connect',
  'connectOrCreate',
  'create',
  'createMany',
  'set',
  'disconnect',
  'delete',
  'deleteMany',
  'update',
  'updateMany',
  'upsert',
]);

/**
 * Refuses nested relation writes. Connecting a relation whose foreign key includes workspaceId
 * copies the target's workspaceId onto the row, silently moving it to another workspace; the
 * foreign key can't catch that because the result is consistent. Set the foreign key field
 * (e.g. `folderId`) instead: the composite key then rejects a foreign workspace's id.
 */
function assertNoNestedWrites(row: Args) {
  for (const [field, value] of Object.entries(row)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      Object.keys(value).some((k) => RELATION_OPS.has(k))
    ) {
      throw new TenantScopeError(
        `Nested relation write on "${field}" is not allowed on a workspace-scoped client; set the foreign key field instead`,
      );
    }
  }
}

function stampData(data: unknown, workspaceId: string): Args {
  const row = (data ?? {}) as Args;
  assertNoNestedWrites(row);
  if (row.workspaceId !== undefined && row.workspaceId !== workspaceId) {
    throw new TenantScopeError('Cannot write a row for another workspace');
  }
  return { ...row, workspaceId };
}

function guardUpdate(data: unknown, workspaceId: string): unknown {
  const row = (data ?? {}) as Args;
  assertNoNestedWrites(row);
  if (row.workspaceId !== undefined && row.workspaceId !== workspaceId) {
    throw new TenantScopeError('Cannot move a row to another workspace');
  }
  return data;
}

/**
 * Rewrites Prisma query args so they only touch rows of one workspace.
 * Reads and bulk writes get `AND workspaceId = …`; unique lookups get the extra filter
 * (Prisma allows non-unique fields in a unique `where`); creates are stamped with the id.
 */
export function scopeArgs(operation: string, args: Args | undefined, workspaceId: string): Args {
  const a: Args = { ...args };

  if (WHERE_OPS.has(operation)) {
    a.where = a.where ? { AND: [a.where, { workspaceId }] } : { workspaceId };
    if ('data' in a) a.data = guardUpdate(a.data, workspaceId);
    return a;
  }
  if (UNIQUE_WHERE_OPS.has(operation)) {
    a.where = { ...(a.where as Args), workspaceId };
    if ('data' in a) a.data = guardUpdate(a.data, workspaceId);
    return a;
  }
  if (operation === 'create') {
    a.data = stampData(a.data, workspaceId);
    return a;
  }
  if (CREATE_MANY_OPS.has(operation)) {
    const rows = Array.isArray(a.data) ? a.data : [a.data];
    a.data = rows.map((r) => stampData(r, workspaceId));
    return a;
  }
  if (operation === 'upsert') {
    a.where = { ...(a.where as Args), workspaceId };
    a.create = stampData(a.create, workspaceId);
    a.update = guardUpdate(a.update, workspaceId);
    return a;
  }
  throw new TenantScopeError(
    `Operation "${operation}" is not supported on a workspace-scoped client`,
  );
}

export interface Db {
  /** Unscoped client: only for platform code, auth and admin. Modules use `forWorkspace`. */
  client: PrismaClient;
  /**
   * A client whose queries on workspace-owned models are always limited to one workspace.
   * `scopedModels` is the list of models with a `workspaceId` column (kept in @socioboard/db).
   */
  forWorkspace(workspaceId: string): PrismaClient;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

export interface CreateDbOptions {
  url: string;
  poolSize: number;
  /** Prisma model names (e.g. "Post") that carry a workspaceId column. */
  scopedModels: readonly string[];
}

export function createDb({ url, poolSize, scopedModels }: CreateDbOptions): Db {
  const client = createPrismaClient({ url, maxConnections: poolSize });
  const scoped = new Set(scopedModels);

  return {
    client,

    forWorkspace(workspaceId) {
      const scopeQuery = ({ model, operation, args, query }: QueryHookParams) =>
        scoped.has(model) ? query(scopeArgs(operation, args, workspaceId)) : query(args);
      // The scoped client keeps the plain PrismaClient type, so repositories accept either.
      return client.$extends({
        query: { $allModels: { $allOperations: scopeQuery } },
      }) as unknown as PrismaClient;
    },

    async ping() {
      try {
        await client.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    },

    close: () => client.$disconnect(),
  };
}
