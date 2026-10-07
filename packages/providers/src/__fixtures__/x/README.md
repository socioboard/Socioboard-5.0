# X fixtures

X API v2 answers the X adapters are tested against (`replayFetch` in `src/testing/replay.ts`). Ids,
names and tokens are fakes.

They follow the shapes in X's API reference (docs.x.com, checked 2026-10-06): OAuth 2.0 token and
`/2/users/me`, `POST /2/tweets`, the v2 media upload (`/2/media/upload`, `initialize`, `append`,
`finalize`, `STATUS`), and its error answers (problem details with `title`, `detail`, `type`;
401 for a refused token, 429 with `x-rate-limit-reset`, 403 for a duplicate post, 503).

Real answers recorded from the Socioboard development app go in `recorded/` once read-only calls
have been made against a connected test account (each read costs credits on pay per use).
