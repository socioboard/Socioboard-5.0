# Socioboard 6.0

Open-source social media management: publish and schedule to every major network, with team workflows and AI-generated media. Licensed under AGPL-3.0; the same code runs as the hosted cloud or self-hosted.

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
pnpm dev                  # api :3000, web :5173
```

## Commands

| Command                              | What it does                                            |
| ------------------------------------ | ------------------------------------------------------- |
| `pnpm install`                       | Install all workspaces                                  |
| `pnpm services:up` / `services:down` | Start or stop local Postgres, Valkey and Mailpit        |
| `pnpm services:reset`                | Stop services and delete their data                     |
| `pnpm dev`                           | Run api, worker and web in watch mode                   |
| `pnpm build`                         | Build every app                                         |
| `pnpm typecheck`                     | Type-check every workspace                              |
| `pnpm lint`                          | ESLint (type-aware)                                     |
| `pnpm deps:check`                    | Architecture boundary rules (dependency-cruiser)        |
| `pnpm format`                        | Format with Prettier                                    |
| `pnpm check`                         | Everything CI runs: format, lint, boundaries, typecheck |

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

[GNU Affero General Public License v3.0](LICENSE). If you run a modified version as a network service, you must make your source changes available to its users under the same license.
