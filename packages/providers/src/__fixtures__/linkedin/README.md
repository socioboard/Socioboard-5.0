# LinkedIn fixtures

LinkedIn API answers the LinkedIn adapters are tested against (`replayFetch` in
`src/testing/replay.ts`). Ids, names and tokens are fakes.

They follow LinkedIn's documentation (learn.microsoft.com/linkedin, checked 2026-10-08): error
answers are `{ message, serviceErrorCode?, status, code? }`, the OAuth endpoints answer
`{ error, error_description }`. Copied from the docs: the 426 retired version
(`NONEXISTENT_VERSION`), the 429 throttle message, the 500 `INTERNAL_ERROR` code and the token
endpoint's "authorization code not found", the OpenID Connect `userinfo` answer and the token
answer's 60-day `expires_in` (5184000). Illustrative, in the documented shape: the expired and
invalid token's wording and code, the duplicate post's wording, and the token answer's
comma-separated `scope` (documented as space-separated; the adapter reads both).

`error-share-limit.json` is a real answer (2026-10-08, the development app, a member who had posted
several times that day without a verified identity); its 429 status is inferred from the worker
having recorded it as a rate limit.

Real answers recorded from the Socioboard development app go in `recorded/` once a test account
is connected; replace the illustrative ones with them.
