import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';

export { Prisma, PrismaClient } from './generated/prisma/client';
export { WORKSPACE_SCOPED_MODELS } from './scoped-models';

export interface CreateDbOptions {
  url: string;
  /** Pool size per process; api and worker each hold their own pool. */
  maxConnections?: number;
}

/** Creates the Prisma client. Call once per process and inject it; never import a global. */
export function createPrismaClient({ url, maxConnections = 10 }: CreateDbOptions): PrismaClient {
  const adapter = new PrismaPg({ connectionString: url, max: maxConnections });
  return new PrismaClient({ adapter });
}
