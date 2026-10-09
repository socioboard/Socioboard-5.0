# YouTube fixtures

Recordings and documented answers for YouTube Data API v3 (Google OAuth 2.0).

- `channel.json`: channel info (`channels.list?mine=true&part=snippet`)
- `video-created.json`: resumable upload initialization + upload
- `error-invalid-token.json`: 401 unauthenticated token
- `error-expired-token.json`: 401 expired token
- `error-rate-limit.json`: 403 quotaExceeded
- `error-content.json`: 400 bad content / invalid title
- `error-server.json`: 500 internal server error
