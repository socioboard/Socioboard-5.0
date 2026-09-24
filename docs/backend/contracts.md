# Package: contracts

**Phase:** 0 (base types), then each phase adds its module's schemas in the phase's first two days · **Path:** `packages/contracts`

The single source of truth for what the API accepts and returns. Shared by backend (validation, OpenAPI) and frontend (typed client, forms).

## Layout
```
packages/contracts/src/
├─ common.ts          ids (UUIDv7), ISO dates (UTC), pagination, error envelope + common codes, money
├─ permissions.ts     roles, permission keys, role → permission map, can() (used by API and UI)
├─ route.ts           defineRoute() and the types derived from a route
├─ events.ts          Socket.IO event names + payload schemas (phase 2, with realtime)
├─ <module>.ts        one file per backend module: request/response schemas + route definitions
└─ index.ts
```

## Route definitions
Each endpoint is declared once:
```ts
export const createPost = defineRoute({
  method: 'POST',
  path: '/api/v1/workspaces/:workspaceId/posts',
  access: 'posts:create',
  summary: 'Create a post',
  params: z.object({ workspaceId: Id }),
  body: CreatePostBody,
  responses: { 201: PostSchema },
});
```
- `access` is `'public'`, `'user'` (any signed-in user), `'member'` (any member of `:workspaceId`) or a permission key. Finer rules from the module docs ("`members:manage` or self", "owner", "matching email") are checked in the service on top. `defineRoute` refuses workspace access on a path without `:workspaceId`, and non-camelCase params.
- `responses` maps success statuses to schemas; `null` means no body (204).
- Backend: `router.route(createPost, handler)` applies `validate()` + `requirePermission()` from the definition.
- Frontend: the typed client is generated from the same definitions (`api.posts.create({ workspaceId, body })`).
- OpenAPI: generated from the definitions with zod-to-openapi.

## Rules
- Changing a contract is a reviewed change; breaking changes need both sides updated in the same PR.
- Every module doc's API table must match its contracts file; CI checks that every defined route has a handler.
