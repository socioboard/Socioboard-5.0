# Socioboard 6.0 — Documentation

Socioboard 6.0 is a from-scratch rebuild of [Socioboard 5.0](https://github.com/socioboard/Socioboard-5.0) as a single-edition, fully open-source (AGPL-3.0) social media management platform.

**Tech lead:** Chethan

## Start here

**Everyone, in this order:**
1. [Architecture](architecture.md): what we're building and how it fits together
2. [Roadmap](roadmap.md): phases, decisions log, parked ideas
3. [Stages](stages/README.md): how we build, then the current phase doc (starting with [phase 0](stages/phase-0.md))
4. [Traceability map](traceability.md): where every piece of code lives and which task builds it

**Then by role:**
| You are | Read next |
| --- | --- |
| Backend developer | [Backend conventions](backend/README.md) → [contracts](backend/contracts.md) → [platform](backend/modules/platform.md) → the module docs for your current tasks |
| Frontend developer | [Frontend conventions](frontend/README.md) → [design system](frontend/design-system.md) → the area docs for your current tasks |
| DevOps | [Infra](infra.md) → [phase 0](stages/phase-0.md) infra tasks |
| Platform accounts owner (Chethan) | [Developer apps](developer-apps.md) |

**Picking up a task:** find its ID in the phase doc → open the module/area doc linked there → build it following the working rules at the end of the [traceability map](traceability.md).

## Documents

| Document | Contents |
| --- | --- |
| [Architecture](architecture.md) | Overview, scope, system design, tech stack, data model, publishing pipeline, network integrations, AI integration, auth & billing, admin console, platform concerns |
| [Roadmap](roadmap.md) | Phased milestones, open questions, decisions log |
| [Developer apps](developer-apps.md) | Per-network checklist for registering and getting developer apps approved |
| [Backend](backend/README.md) | Conventions, permissions, [contracts](backend/contracts.md), and one doc per module (22 incl. platform and feeds): data, API endpoints, services, jobs, rules |
| [Frontend](frontend/README.md) | Stack, routes, conventions, one doc per area (15), and the [design system](frontend/design-system.md) |
| [Stages](stages/README.md) | How we build (vertical slices) and task checklists for phases 0–6 with done criteria |
| [Traceability map](traceability.md) | Every code unit (app, package, module, area, test suite) → phase → task IDs, plus branch/commit/PR rules |
| [Infra](infra.md) | Tooling, containers, CI/CD, environments, backups, monitoring, self-host package |

## Source of truth

**This `docs/` folder is the source of truth.** Change it in the same PR as the code it describes.

Two shareable summaries exist outside the repo (architecture and roadmap only, no module or stage detail):
- **[Socioboard 6.0 Blueprint](https://claude.ai/artifact/1HtJn44VEaoNR2FE3tthW7)**: clean one-page overview for reading and sharing
- **[Architecture & Roadmap (Claude Docs)](https://claude.ai/code/artifact/0d7f3bc1-1b63-43d4-ba00-774c77c511a4)**: live doc for comments and discussion

When a decision changes in either summary, update `architecture.md` / `roadmap.md` here too.

## Reference

- Socioboard 5.0 source, used only as a feature reference: `../../Socioboard-5.0/`. No code carries over.
