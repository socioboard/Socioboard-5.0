# Contributing to Socioboard

Thanks for helping. Socioboard 6.0 is MIT licensed, and the same code runs the hosted cloud and
self-hosted installs, so every change has to work for both.

## The short version

1. Find or propose the task: work is planned in [`docs/stages`](docs/stages/README.md). For
   anything bigger than a small fix, open an issue first so we can agree on the approach.
2. Set up the repo (see the [README](README.md#getting-started)) and create a branch.
3. Make the change **with its tests and its docs**.
4. Run `pnpm check` and the tests locally.
5. Commit with a sign-off (`git commit -s`) and open a pull request.

## License and sign-off (DCO)

Contributions come in under the project's [MIT license](LICENSE). There is no CLA. Instead, every
commit in a pull request must carry a **Developer Certificate of Origin** sign-off: a line at the
end of the commit message saying you wrote the change, or otherwise have the right to submit it
under the project's license. The full text is at <https://developercertificate.org>.

```
Signed-off-by: Your Name <you@example.com>
```

`git commit -s` adds it, using your `user.name` and `user.email`; the name and address must match
the commit's author. Forgot? Add it to your last commit with `git commit --amend -s`, or to every
commit on your branch with `git rebase --signoff main`, then force-push the branch. A CI check
refuses pull requests from forks whose commits aren't signed off.

## How we work

- **Docs are the source of truth.** The behaviour of each module and screen is described in
  [`docs/`](docs/README.md): backend modules in `docs/backend/modules`, screens in
  `docs/frontend/areas`, the plan in `docs/stages`. A change in behaviour updates its doc in the
  same pull request; if the doc and the code disagree, that's a bug in one of them.
- **Branches:** `p<phase>/<module>/<task-id>-<name>`, e.g. `p1/web/P1-F6-posts`.
- **Commits:** `type(module): summary` (types: feat, fix, test, docs, refactor, chore, ci),
  a body saying why when it isn't obvious, a `Task: <ID>` line, and your sign-off.
- **Pull requests:** the title starts with the task ID. Say what changed, how you tested it,
  and anything a reviewer should look at closely. Keep a pull request to one task.

## Tests

Every change comes with tests at the right level, and every bug fix with a test that fails
without the fix.

| Command         | What                                                                             | Needs                                                                |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm test`     | Unit tests (Vitest; the web app with Testing Library)                            | Nothing                                                              |
| `pnpm test:int` | Integration tests: the real API against Postgres, Valkey and a local S3 (RustFS) | `COMPOSE_PROFILES=local-s3 pnpm services:up`, then `pnpm db:migrate` |
| `pnpm e2e`      | Playwright end to end: each phase's main flow in a browser                       | Services up; storage from `.env`, else the local S3                  |
| `pnpm check`    | Format, lint, architecture boundaries, types                                     | Nothing                                                              |

CI runs all of these on every pull request, plus a secret scan and a smoke test of the built
Docker images. The suite that publishes to real Facebook and Instagram accounts
(`pnpm --filter @socioboard/web e2e:meta`) is for maintainers and never runs in CI.

## Code

- TypeScript everywhere, strict. API shapes live in `packages/contracts` (Zod) and both the API
  and the web app use them; the API routes table in the backend docs must match.
- Architecture boundaries are enforced (`pnpm deps:check`): features reach each other through
  their `index.ts`, packages never import apps, the web app never imports server code.
- Everything a person reads goes through i18n (`apps/web/src/locales`), in plain words: say what
  happened and what to do next. Errors never apologise, and are never vague.

## Interface

The visual direction, tokens and components are in the
[design system](docs/frontend/design-system.md). In short:

- **Accessible by default:** keyboard, focus, labels, contrast, screen readers; Testing Library
  tests query by role and name.
- **Cursors:** everything clickable shows the pointer, anything disabled shows "not allowed"
  (the end-to-end tests check every control).
- **Motion answers what the person did** and follows Apple's fluid-interface rules: no overshoot
  unless a gesture carried momentum, input is never locked out, and reduced motion gets short
  crossfades instead of movement. Use the design system's motion helpers rather than one-off
  animations.
- Light and dark themes, phone to desktop, reduced transparency and more contrast all have to
  work.

## Security

Please don't report security problems in public issues. Use GitHub's
**"Report a vulnerability"** (the repository's Security tab) so the report stays private until a
fix is out. Never commit secrets: `.env` is git-ignored, and CI scans the history.

## Questions

Open a discussion or an issue. If you're unsure whether something is wanted, ask before you
build it: it saves both of us time.
