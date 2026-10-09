# Pinterest fixtures

Pinterest API answers the Pinterest adapters are tested against (`replayFetch` in
`src/testing/replay.ts`). Ids, names and tokens are fakes.

Shapes follow Pinterest's OpenAPI spec v5.28.0 (github.com/pinterest/api-description, checked
2026-10-09): `OauthAccessToken` for the token answers (30-day `expires_in` 2592000; the 60-day
continuous refresh token, `refresh_token_expires_in` 5184000), `Account` for `GET /user_account`,
and `{ code, message }` (`Pinterest.Lib.Error`) for every error. The token endpoint's HTTP Basic
header is `client:secret` in base64. Pinterest's docs show scopes both comma- and
space-separated, so the exchange uses commas and the refresh spaces.

The publish recordings (`pin-created`, `error-pin-*`) start with a `GET` of the image from our own
storage (`https://storage.test/…`, 12 fake bytes, `BwcHBwcHBwcHBwcH` in base64), then
`POST /v5/pins` with `image_base64`. `boards.json` is one page of `GET /v5/boards`
(`{ items, bookmark }`) with one board of each privacy, the secret one to show it's left out.

`video-pin.json` is a video pin end to end, in the order of Pinterest's "Create boards and Pins"
guide: register (`POST /media` → `media_id`, `upload_url`, `upload_parameters`), our storage
download (24 fake bytes), the multipart upload to `upload_url` (the parameters, then `file`; 204),
two status checks (`processing`, then `succeeded`), and the pin with `video_id` and a cover frame.

Illustrative, in the documented shape: every error's `code` number and wording (the spec gives the
shape, not the codes), and which fields the created pin and the boards come back with.

Real answers recorded from a Socioboard development app go in `recorded/` once a test account is connected;
replace the illustrative ones with them.
