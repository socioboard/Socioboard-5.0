# Pinterest fixtures

Pinterest API answers the Pinterest adapters are tested against (`replayFetch` in
`src/testing/replay.ts`). Ids, names and tokens are fakes.

Shapes follow Pinterest's OpenAPI spec v5.28.0 (github.com/pinterest/api-description, checked
2026-10-09): `OauthAccessToken` for the token answers (30-day `expires_in` 2592000; the 60-day
continuous refresh token, `refresh_token_expires_in` 5184000), `Account` for `GET /user_account`,
and `{ code, message }` (`Pinterest.Lib.Error`) for every error. The token endpoint's HTTP Basic
header is `client:secret` in base64. Pinterest's docs show scopes both comma- and
space-separated, so the exchange uses commas and the refresh spaces.

Illustrative, in the documented shape: every error's `code` number and wording (the spec gives the
shape, not the codes).

Real answers recorded from a Socioboard development app go in `recorded/` once a test account is connected;
replace the illustrative ones with them.
