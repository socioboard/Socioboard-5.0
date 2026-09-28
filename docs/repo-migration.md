# Repo migration: one `socioboard/socioboard` repo

As of 2026-09-28 · Task P0-I9 · See also: [Infra](infra.md)

Socioboard 6.0 moves into the existing **Socioboard-5.0** repo, which is renamed to `socioboard`. That repo keeps its stars (1,513), forks (411), releases and tags, and GitHub redirects the old URL. The other two repos become archive branches inside it and are archived themselves.

## Decisions (SG, 2026-09-28)

- `main` has the latest code (6.0); older code lives on branches.
- The combined repo is renamed to `socioboard`.
- socioboard-core (C#) comes in as a branch too. Cost: a full `git clone` downloads about 500 MB of old history; contributors use `git clone --single-branch --branch main`.
- Open 5.0 issues stay open with a `5.0` label.

## Target layout

| Branch | Content | Tag |
| --- | --- | --- |
| `main` (default) | Socioboard 6.0. The 5.0 history stays in its ancestry (merged with `-s ours`), so the contributors graph keeps the 5.0 contributors | |
| `archive/5.0` | Socioboard 5.0 `master`, full history | `v5.0-final` |
| `archive/6.0-prototype` | The 2026 prototype (`socioboard/socioboard` repo), full history | `prototype-final` |
| `archive/core-csharp`, `archive/core-csharp-3.0` | socioboard-core `master` and `socioboard-3.0`, full history | `core-final`; its 35 tags as `core/<name>` |

The old prototype repo is renamed `socioboard-6-prototype`, and it and `socioboard-core` are archived with a README pointing here. They are never deleted (stars, forks, and core's 1.7 GB of release downloads stay there).

## Steps and progress

| # | Step | Needs | Status |
| --- | --- | --- | --- |
| 0 | Join the org, get admin, announce a short merge freeze | SG | Partly: member of `Socioboard-developers`, **not yet of the `socioboard` org** (repos are there); write access only |
| 1 | Backups: `git clone --mirror` of all three repos + wikis, verified bundles, JSON export of issues, PRs, comments, releases, labels, milestones | read | **Done 2026-09-28** (below) |
| 2 | Push `archive/6.0-prototype`, `archive/core-csharp`, `archive/core-csharp-3.0`, `prototype-final`, `core-final`, `core/*` tags into the 5.0 repo | write | **Done 2026-09-28**: 4 archive branches verified against the mirrors, 35 `core/` tags plus `prototype-final` and `core-final` |
| 3 | `archive/5.0` + `v5.0-final` from `master` (`1ec4ff50`); retarget the 9 open PRs to `archive/5.0`; label open issues and PRs `5.0` | write | **Done 2026-09-28**: `archive/5.0` = old `master` (`1ec4ff50`), 9 PRs retargeted, 28 issues and 9 PRs labelled `5.0` |
| 4 | Rename default branch `master` → `main` (Settings → Branches) | admin | Waiting for admin |
| 5 | Put 6.0 on `main`: in this repo, `git fetch` the old `main`, `git merge -s ours --allow-unrelated-histories` it into our history, push as a fast-forward (no force-push). Check the tree equals 6.0 and `archive/5.0` equals the old `master` | admin (for the protected switch) | Waiting |
| 6 | Rename `socioboard` (prototype) → `socioboard-6-prototype`, then `Socioboard-5.0` → `socioboard`; update description, topics, website; README with a "Looking for 5.0?" link; root LICENSE AGPL-3.0 | admin | Waiting |
| 7 | README pointer + archive `socioboard-6-prototype` and `socioboard-core`; transfer core's 15 open issues with a `core-legacy` label; close its 1 PR with a note pointing to `archive/core-csharp` | admin (core is read-only for us) | Waiting |
| 8 | Ruleset on `main`: PR + 1 review, no force-push or deletion, linear history, CI checks once P0-I4 lands. `archive/*`: no deletion or force-push. Teams, CODEOWNERS, org 2FA | admin | Waiting. Today nothing on the 5.0 repo is protected |
| 9 | Point the local repo at the new remote; update docs (decisions log, infra, links to `Socioboard-5.0`) | | Waiting |

Steps 2 and 3 only added branches, tags and labels and changed PR targets; nothing was removed. Script: `_repo-backups/run-steps-2-3.sh`. GitHub reports 270 Dependabot alerts on 5.0's `master`; they go away when 6.0 becomes the default branch.

## Backup (step 1)

Local, outside any repo: `socioboard-revive/_repo-backups/2026-09-28/` (copy it to a second place as well).

| Repo | Mirror + bundle | Branches / tags | Issues + PRs / comments | Releases | Wiki |
| --- | --- | --- | --- | --- | --- |
| Socioboard-5.0 | 206 MB | 34 / 63 | 433 (184 PRs) / 1,202 | 60, no files | 60 commits |
| socioboard (prototype) | 1.7 MB | 1 / 0 | 0 / 0 | 0 | none |
| socioboard-core | 306 MB | 2 / 35 | 54 (1 PR) / 152 | 32, 9 files (1.7 GB, not downloaded; they stay on the archived repo) | 12 commits |

No repo uses Git LFS. Largest file: 83 MB in core (GitHub accepts it with a warning).

## Checks after each step

- Each archive branch's head equals the source repo's (`git ls-remote` vs the mirror).
- Tag counts: 63 (5.0) plus 35 `core/` tags, plus the three `*-final` tags.
- Releases still point at their tags; stars and forks unchanged after the rename; `github.com/socioboard/Socioboard-5.0` redirects.
- Old clones can still `git pull`.

## Rollback

- Before step 6: delete the added branches and tags; the originals are untouched.
- After step 6: rename the repos back (redirects follow) and restore `master` from `v5.0-final`.
- Worst case: restore from the step 1 mirrors (`git push --mirror` into a fresh repo).
