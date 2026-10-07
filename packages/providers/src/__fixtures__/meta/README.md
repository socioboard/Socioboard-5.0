# Meta fixtures

Graph API answers the Meta adapters are tested against (`replayFetch` in `src/testing/replay.ts`).
Ids, names and tokens are fakes.

Two kinds of files:

- **`recorded/`**: real answers recorded from the Socioboard development app on 2026-09-29
  (read-only calls: who signed in, the Pages list with a linked Instagram account, a post's
  permalink, a refused token), then sanitized: every id, name, token, cursor and URL is replaced
  by a consistent fake, so the shapes are exact and nothing real is kept. Real details they pin
  down: a Page without a username has no `username` field at all, a Page without Instagram has no
  `instagram_business_account`, and a Page can grant `CREATE_CONTENT` without `MANAGE`.
- **The rest**: calls that can't be recorded without posting for real (publishing, uploads) or
  can't be caused on demand (rate limits, server errors). They follow the shapes in Meta's Graph
  API reference (v25.0, checked 2026-09-29).

To record again: run a read-only recording against a connected dev login (every call not a GET
is refused while recording), keep the raw answers outside the repo, and sanitize them into
`recorded/` with the same file names.

| File                                       | What                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `oauth-exchange.json`                      | code → short-lived token → long-lived token → granted permissions             |
| `me-accounts.json`                         | the person's Pages over two result pages, one with a linked Instagram account |
| `error-expired-token.json`                 | code 190 / 463: the token expired (reconnect)                                 |
| `error-rate-limit.json`                    | code 32: Page request limit reached                                           |
| `error-content.json`                       | code 100 with a user-facing message: the post was refused                     |
| `error-server.json`                        | HTTP 500 with code 2: temporary problem                                       |
| `instagram-login-exchange.json`            | Instagram Login: code → short-lived token (wrapped in `data`) → 60-day token  |
| `instagram-login-me.json`                  | Instagram Login: who signed in (the login is the account; `user_id` a number) |
| `instagram-login-error-invalid-token.json` | Instagram Login: code 190, a token graph.instagram.com refuses                |
| `instagram-publish-limit.json`             | code 9 / 2207042: the account's 100 posts per 24 hours are used up            |
| `recorded/me.json`                         | who signed in (recorded)                                                      |
| `recorded/me-accounts.json`                | two Pages, one with a linked Instagram account (recorded)                     |
| `recorded/permalink.json`                  | a published post's permalink (recorded)                                       |
| `recorded/error-invalid-token.json`        | code 190: a token Meta can't parse (recorded)                                 |
