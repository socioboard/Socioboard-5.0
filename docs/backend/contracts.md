# Package: contracts

**Phase:** 0 (base types), then each phase adds its module's schemas in the phase's first two days · **Path:** `packages/contracts`

The single source of truth for what the API accepts and returns. Shared by backend (validation, OpenAPI) and frontend (typed client, forms).

## Layout
```
packages/contracts/src/
├─ common.ts          ids (UUIDv7), ISO dates, pagination, error envelope, money
├─ permissions.ts     permission keys + role → permission map (used by API and UI)
├─ events.ts          Socket.IO event names + payload schemas
├─ <module>.ts        one file per backend module: request/response schemas + route definitions
└─ index.ts
```

## Route definitions
Each endpoint is declared once:
```ts
export const createPost = defineRoute({
  method: 'POST',
  path: '/api/v1/workspaces/:workspaceId/posts',
  permission: 'posts:create',
  body: CreatePostBody,
  response: { 201: PostSchema },
});
```
- Backend: `router.route(createPost, handler)` applies `validate()` + `requirePermission()` from the definition.
- Frontend: the typed client is generated from the same definitions (`api.posts.create({ workspaceId, body })`).
- OpenAPI: generated from the definitions with zod-to-openapi.

## Rules
- Changing a contract is a reviewed change; breaking changes need both sides updated in the same PR.
- Every module doc's API table must match its contracts file; CI checks that every defined route has a handler.
