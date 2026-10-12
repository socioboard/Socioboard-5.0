# Tumblr fixtures

Tumblr API v2 answers the Tumblr adapters are tested against (`replayFetch` in `src/testing/replay.ts`).
Ids, names, blogs, and tokens are fakes.

They currently follow the shapes in Tumblr's API v2 reference; they are not recorded responses.
Record and sanitize the read call (`GET /v2/user/info`) from the dev app once its keys are on
staging. Publishing answers and errors that cannot be caused safely can remain documentation-shaped.

- OAuth 2.0 token exchange and `GET https://api.tumblr.com/v2/user/info`
- `POST https://api.tumblr.com/v2/blog/{blog_identifier}/posts` (NPF Neue Post Format)
- Error responses (`meta.status`, `errors[].title`, `errors[].code`, `errors[].detail`)
