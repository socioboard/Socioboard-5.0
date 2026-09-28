# Socioboard 6.0

Open-source social media management: publish and schedule to every major network, with team workflows and AI-generated media. MIT licensed; the same code runs as the hosted cloud or self-hosted.

**Start with the docs:** [docs/README.md](docs/README.md)

## Requirements

- Node 24 (see `.nvmrc`)
- pnpm 12 (`corepack enable`)
- Docker for local Postgres, Valkey and Mailpit
- For media: an S3 dev bucket, or local MinIO if you have no S3 (see `.env.example`)

## Getting started

```sh
corepack enable
pnpm install
cp .env.example .env      # fill in your S3 dev bucket, or enable the MinIO block
pnpm services:up          # Postgres :5440, Valkey :6380, Mailpit :1025 (UI :8025), MinIO :9000 (console :9001) if enabled
pnpm db:migrate           # create or update the database tables
pnpm db:seed              # optional: demo users, workspace and media (see below)
pnpm dev                  # api :3000, web :5173
```

### Demo data

`pnpm db:seed` adds one user per workspace role (`owner@socioboard.test`, `admin@`, `editor@`,
`contributor@`, `viewer@`, all with the password in `SEED_PASSWORD`, default
`socioboard-dev-password`), a **Demo Workspace** (`demo`) with all of them as members, and four
sample images when storage is configured. On an empty database the owner becomes platform admin.
Running it again only adds what is missing. It refuses to run with `NODE_ENV=production`.

## Commands

| Command                              | What it does                                                      |
| ------------------------------------ | ----------------------------------------------------------------- |
| `pnpm install`                       | Install all workspaces                                            |
| `pnpm services:up` / `services:down` | Start or stop local Postgres, Valkey and Mailpit                  |
| `pnpm services:reset`                | Stop services and delete their data                               |
| `pnpm db:migrate` / `db:studio`      | Apply database migrations (and create new ones) / browse data     |
| `pnpm db:seed`                       | Add development data (safe to run again)                          |
| `pnpm dev`                           | Run api, worker and web in watch mode                             |
| `pnpm build`                         | Build every app                                                   |
| `pnpm typecheck`                     | Type-check every workspace                                        |
| `pnpm lint`                          | ESLint (type-aware)                                               |
| `pnpm deps:check`                    | Architecture boundary rules (dependency-cruiser)                  |
| `pnpm format`                        | Format with Prettier                                              |
| `pnpm test` / `pnpm test:int`        | Unit tests / integration tests against local services             |
| `pnpm e2e`                           | Browser tests of each phase's main flow (needs the MinIO profile) |
| `pnpm catalog`                       | Component catalog (Ladle) at http://localhost:61000               |
| `pnpm check`                         | Everything CI runs: format, lint, boundaries, typecheck           |

## Layout

| Path                 | Contents                                     |
| -------------------- | -------------------------------------------- |
| `apps/api`           | Express 5 HTTP API                           |
| `apps/worker`        | BullMQ job processors                        |
| `apps/web`           | React + Vite web app                         |
| `packages/core`      | Domain modules shared by api and worker      |
| `packages/contracts` | Zod schemas and types shared by API and web  |
| `packages/providers` | Social network adapters                      |
| `packages/db`        | Prisma schema, migrations, seed              |
| `packages/ui`        | Shared React components                      |
| `packages/emails`    | Email templates                              |
| `packages/billing`   | Stripe billing, plans and limits             |
| `docs/`              | Architecture, roadmap, module and phase docs |

## Working rules

Every change belongs to a task in [docs/stages](docs/stages/README.md). Branch `p<phase>/<module>/<task-id>-<name>`, commit `type(module): summary` with a `Task: <ID>` line, PR title starts with the task ID.

## License

[MIT](LICENSE). Use, change and host it, commercially too; keep the copyright and license notice.
