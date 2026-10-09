# Tumblr fixtures

Tumblr API v2 answers the Tumblr adapters are tested against (`replayFetch` in `src/testing/replay.ts`).
Ids, names, blogs, and tokens are fakes.

They follow the shapes in Tumblr's API v2 reference:

- OAuth 2.0 token exchange and `GET https://api.tumblr.com/v2/user/info`
- `POST https://api.tumblr.com/v2/blog/{blog_identifier}/posts` (NPF Neue Post Format)
- Error responses (`meta.status`, `errors[].title`, `errors[].code`, `errors[].detail`)
