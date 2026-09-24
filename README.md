# Socioboard 6.0

Open-source social media management: publish and schedule to every major network, with team workflows and AI-generated media. MIT licensed; the same code runs as the hosted cloud or self-hosted.

**Start with the docs:** [docs/README.md](docs/README.md)

## Requirements
- Node 24 (see `.nvmrc`)
- pnpm 12 (`corepack enable`)
- Docker for local Postgres, Valkey, MinIO and Mailpit (arrives in P0-I3)

## Commands
| Command | What it does |
| --- | --- |
| `pnpm install` | Install all workspaces |
| `pnpm dev` | Run api, worker and web in watch mode |
| `pnpm build` | Build every app |
| `pnpm typecheck` | Type-check every workspace |

## Layout
| Path | Contents |
| --- | --- |
| `apps/api` | Express 5 HTTP API |
| `apps/worker` | BullMQ job processors |
| `apps/web` | React + Vite web app |
| `packages/core` | Domain modules shared by api and worker |
| `packages/contracts` | Zod schemas and types shared by API and web |
| `packages/providers` | Social network adapters |
| `packages/db` | Prisma schema, migrations, seed |
| `packages/ui` | Shared React components |
| `packages/emails` | Email templates |
| `packages/billing` | Stripe billing, plans and limits |
| `docs/` | Architecture, roadmap, module and phase docs |

## Working rules
Every change belongs to a task in [docs/stages](docs/stages/README.md). Branch `p<phase>/<module>/<task-id>-<name>`, commit `type(module): summary` with a `Task: <ID>` line, PR title starts with the task ID.
