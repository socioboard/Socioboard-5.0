/**
 * Prisma models that carry a `workspaceId` column. Queries on these through
 * `db.forWorkspace(id)` are always limited to that workspace. Add every new
 * workspace-owned model here (P0-B1 adds the first ones; a test in P0-B9 checks
 * this list against the schema).
 */
export const WORKSPACE_SCOPED_MODELS: readonly string[] = [];
