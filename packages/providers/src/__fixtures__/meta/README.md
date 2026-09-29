# Meta fixtures

Graph API answers the Meta adapters are tested against (`replayFetch` in `src/testing/replay.ts`).
Ids, names and tokens are fakes.

These first files follow the response shapes in Meta's Graph API reference (v25.0, checked
2026-09-29). P1-B9 replaces them with answers recorded from the Socioboard development app and
its test users, keeping the same file names.

| File                            | What                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `oauth-exchange.json`           | code → short-lived token → long-lived token → granted permissions             |
| `me-accounts.json`              | the person's Pages over two result pages, one with a linked Instagram account |
| `error-expired-token.json`      | code 190 / 463: the token expired (reconnect)                                 |
| `error-rate-limit.json`         | code 32: Page request limit reached                                           |
| `error-content.json`            | code 100 with a user-facing message: the post was refused                     |
| `error-server.json`             | HTTP 500 with code 2: temporary problem                                       |
| `instagram-login-exchange.json` | Instagram Login: code → short-lived token (wrapped in `data`) → 60-day token  |
| `instagram-publish-limit.json`  | code 9 / 2207042: the account's 100 posts per 24 hours are used up            |
