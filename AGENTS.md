# Working in this repo

Rules for everyone who changes this repo: people, and the coding agents they run (Claude Code
reads this through `CLAUDE.md`; Codex reads it directly). Three people work here at once, so most
of these rules exist to keep branches from colliding. The why behind them is in
[CONTRIBUTING.md](CONTRIBUTING.md#working-as-a-team).

## Where things are

- **Docs are the source of truth.** The plan is in `docs/stages` (one task ID per piece of work,
  e.g. `P3-B1`); backend modules in `docs/backend/modules`; screens in `docs/frontend/areas`; the
  visual system in `docs/frontend/design-system.md`; which code belongs to which task in
  `docs/traceability.md`. Read the task's lines and its module's doc before writing code.
- Apps: `apps/api`, `apps/worker`, `apps/web`. Packages: `contracts` (Zod API shapes), `core`
  (platform + modules), `db` (Prisma), `providers` (one folder per network), `ui`, `emails`,
  `billing`. Cross-cutting suites: `tests/chaos`, `tests/scheduling`.

## Before you start

1. The task is assigned to you on the project board. Don't start a task someone else holds, and
   don't change code that belongs to another open task: say what you need in the PR instead.
2. Branch from the latest `origin/6.0`: `p<phase>/<module>/<task-id>-<name>`, e.g.
   `p3/providers/P3-B1-linkedin`.
3. Running more than one agent? Give each its own worktree
   (`git worktree add ../sb-P3-B1 -b p3/providers/P3-B1-linkedin origin/6.0`), never two in one
   checkout.

## While you work

- One task per branch and per pull request. Keep it small and merge it within a day or two;
  rebase on `origin/6.0` every day (`git fetch && git rebase origin/6.0`).
- Every change comes with its tests and its docs in the same pull request. A bug fix comes with
  a test that fails without it.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md#code) and the design system: strict TypeScript, API
  shapes in `packages/contracts`, all text through i18n, the right cursors (pointer when
  clickable, not-allowed when disabled), the design system's motion helpers.
- Free, open-source, self-hosted tools only. Don't add a paid service or SDK.
- Write code that reads like the code around it: same naming, idioms and comment density.

## Commits

```
type(module): summary

Why, when it isn't obvious.

Task: P3-B1
Signed-off-by: Your Name <you@example.com>
```

- Types: feat, fix, test, docs, refactor, chore, ci. Commit with `git commit -s`; the sign-off
  must match the commit's author.
- **No AI attribution:** no `Co-Authored-By` line for an AI and no "Generated with …" line, in
  commits or pull requests. The person who opens the pull request is its author and answers for
  it. CI rejects commits that carry one (`.github/check-commits.sh`).

## Never

- Push to `6.0` or `main`, or force-push a branch someone else works on. Everything reaches `6.0`
  through a reviewed pull request.
- Edit a migration that is already on `6.0`. Add a new one.
- Merge `pnpm-lock.yaml` by hand.
- Commit secrets. `.env` is git-ignored; secrets are shared through the team's password manager.
- Change the Meta app (or any network's developer app) settings. Only the tech lead does.
- Run `pnpm --filter @socioboard/web e2e:meta` without asking the team first: it publishes real
  posts to the shared test Page, and two runs at once trip over each other.
- Edit files while `pnpm e2e` or `pnpm test:chaos` is running: they load the source.

## Shared files

These are touched by many tasks. Follow the rule so parallel branches merge cleanly.

| File                                                                                                                                                                           | Rule                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/`                                                                                                           | One open pull request with a migration at a time: claim it on the board. If `6.0` gained a migration while yours was open, delete yours, rebase, and generate it again (`pnpm db:migrate`) |
| `pnpm-lock.yaml`                                                                                                                                                               | On a conflict, take `6.0`'s copy (`git checkout --theirs pnpm-lock.yaml` while rebasing) and run `pnpm install`                                                                            |
| Lists every network adds to (`packages/contracts/src/networks.ts`, `packages/core/src/modules/social-accounts/registry.ts`, the providers registry, config and `.env.example`) | Add one line per entry, at the end of its group, without reformatting the lines around it                                                                                                  |
| `apps/web/src/locales/en/*.json`                                                                                                                                               | One file per feature. Add keys at the end of your feature's section; a network's own strings (its options panel, its preview) go in a file of their own                                    |
| `docs/stages/*.md`                                                                                                                                                             | Tick only your own task's line, in your task's pull request                                                                                                                                |
| Route counts and route tables (`docs/backend`, the routes tests)                                                                                                               | After a rebase, recount; CI fails if they're off                                                                                                                                           |

## Before you open a pull request

```
pnpm check        # format, lint, architecture boundaries, types
pnpm test         # unit tests
pnpm test:int     # integration tests (services up: COMPOSE_PROFILES=local-s3 pnpm services:up)
```

Run `pnpm e2e` too when you changed a screen or a flow. The pull request title starts with the
task ID; fill in the template. Another person reviews and approves it; an AI review can help but
doesn't count as the approval.
