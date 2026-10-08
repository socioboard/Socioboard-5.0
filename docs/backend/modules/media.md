# Module: media

**Phase:** 0 (uploads) – 1 (processing) · **Path:** `packages/core/src/modules/media` · **Depends on:** platform (storage, queue), workspaces, billing (storage limit, optional)

## Purpose
The workspace media library: uploads straight from the browser to Amazon S3, metadata extraction, thumbnails, and public URLs that networks can fetch. AI-generated and discovery-imported files land here too.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `MediaAsset` | id, workspaceId, name, folderId?, kind (image/video/gif), storageKey, mime, sizeBytes, width, height, durationSec, thumbnailKey, source (upload/ai/discovery), aiJobId?, altText?, status (uploading/processing/ready/failed), uploadId? (multipart), uploadedById, createdAt | Soft delete; files purged by the nightly `media-purge` (P1-B10), which also removes uploads left in `uploading` for over a day and aborts their multipart uploads |
| `MediaFolder` | id, workspaceId, name, parentId? | Optional grouping |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/media/uploads` | `media:upload` | Start an upload: returns presigned (multipart) URLs + assetId |
| POST | `/api/v1/workspaces/:wid/media/uploads/:assetId/complete` | `media:upload` | Confirm upload; queues processing |
| GET | `/api/v1/workspaces/:wid/media` | `media:read` | List (filter: kind, source, folder, search) |
| GET | `/api/v1/workspaces/:wid/media/:assetId` | `media:read` | Details + signed view URL |
| PATCH | `/api/v1/workspaces/:wid/media/:assetId` | `media:upload` | Rename, alt text, folder |
| DELETE | `/api/v1/workspaces/:wid/media/:assetId` | `media:upload` | Delete (blocked if used by a scheduled post) |
| GET | `/api/v1/workspaces/:wid/media/folders` | `media:read` | All folders |
| POST | `/api/v1/workspaces/:wid/media/folders` | `media:upload` | Create a folder |
| PATCH | `/api/v1/workspaces/:wid/media/folders/:folderId` | `media:upload` | Rename or move |
| DELETE | `/api/v1/workspaces/:wid/media/folders/:folderId` | `media:upload` | Delete; its assets and subfolders move to its parent |

Schemas: `packages/contracts/src/media.ts`. Uploads up to 16 MB use one presigned PUT; larger files use multipart (16 MB parts) and `complete` sends each part's ETag. Folder routes are registered before `/media/:assetId`.

**Bucket CORS:** because the browser uploads straight to the bucket, the bucket must allow the app's origin to `PUT` (and `POST`) and expose `ETag` (read for each multipart part). Without it every upload fails with a CORS error in the browser; a backend that uploads through the SDK (as AdsGPT does) never needs this. A rule that works: `AllowedOrigins` the app's origins (or `*`), `AllowedMethods` GET, HEAD, PUT, POST, `AllowedHeaders` `*`, `ExposeHeaders` `ETag`.

## Services
- `createUpload(kind, mime, size)`: validates type and size, returns presigned URLs.
- `completeUpload(assetId)`: verifies the object exists, enqueues `media-process`.
- `getPublicUrl(assetId, ttl)`: short-lived URL on `media.<domain>` for networks to fetch.
- `importFromUrl(url, source)`: used by discovery.
- AI outputs arrive as uploads: the AI service gets an upload slot per file (an asset in `uploading` with `source: ai` and `aiJobId`, the same presigned PUT), and the result update completes the ones it names ([ai](ai.md)).
- `prepareImageVariant(image, spec)` (P1-B10): fits an image to a network's `imagePrep` (accepted formats, max width, max bytes). The original is used when it already fits; otherwise a JPEG copy is made once, turned upright by its EXIF orientation, shrunk to the max width and re-compressed (a few qualities, then one informed shrink) until under the size limit, stored as `…/<asset>/variants/jpeg-w<width>-b<bytes>.jpg` and reused. Facebook: JPEG/PNG/GIF up to 10 MB (WebP converted); Instagram: JPEG, 1440 wide, 8 MB. Because images are fitted, validation doesn't flag an image's size for these networks. Videos pass through: no phase 1 network needs a transcode; ffmpeg transcoding joins with the networks that do (phase 3).

## Jobs
- `media-process` (P0-B6): images and GIFs through sharp (dimensions as displayed, EXIF rotation applied; first frame of GIFs); videos through ffprobe (dimensions, duration) and ffmpeg (a frame 1 s in), both reading a signed URL so large files never load into memory. Stores a 480 px WebP thumbnail and marks the asset `ready`. 3 attempts with backoff; after the last it marks the asset `failed`. One job per asset (job id `media-<assetId>`). Without ffprobe/ffmpeg (`FFPROBE_PATH`, `FFMPEG_PATH`) videos become `ready` without duration or thumbnail and the worker logs a warning.
- `media-purge` (nightly, 03:15 UTC, P1-B10): for assets deleted over 7 days ago and uploads left in `uploading` over a day, abort any multipart upload, delete everything under the asset's folder (original, thumbnail, converted copies; `storage.deletePrefix`, which refuses anything but a whole folder), then the row. Only a key inside the asset's own folder (`…/media/<assetId>/`) is purged by folder; any other layout has just its own files deleted, so it can't take its neighbours with it. An asset that fails is skipped for the rest of the run and retried the next night; the others go ahead.
- `workspace-purge` removes a deleted workspace's whole folder (`workspaces/<id>/`), so converted copies and logos go with it.

## Rules
- Files live under `workspaces/<workspaceId>/media/<assetId>/` (`original.<ext>`, `thumb.webp`), so a workspace's files share one prefix.
- Uploads up to 16 MB use one presigned PUT locked to the declared size and type; larger files use multipart (16 MB parts). `complete` checks the stored object's size and type against what was declared (else 422 `UPLOAD_INVALID` and the asset is `failed`), and only one `complete` moves it to `processing`.
- Deleting is soft. A file used by a post that is scheduled or being published (in its content or a network's override) can't be deleted: `MEDIA_IN_USE` (409); drafts don't block, their validation flags the missing file. `media-purge` removes stored files later (P1-B10).
- Error codes: `STORAGE_NOT_CONFIGURED`, `MEDIA_NOT_FOUND`, `FOLDER_NOT_FOUND`, `FOLDER_CYCLE`, `UPLOAD_ALREADY_COMPLETED`, `PARTS_REQUIRED`, `UPLOAD_INCOMPLETE`, `UPLOAD_INVALID`, `MEDIA_IN_USE`, `INVALID_CURSOR`.
- Allowed: JPEG, PNG, WebP, GIF, MP4, MOV. Max 20 MB per image, 1 GB per video (configurable).
- Objects are private; the browser views them through signed URLs (with S3; NAS storage below serves them publicly).
- Storage used counts against `checkLimit('storage')` when billing is on.

## NAS storage
Decided 2026-10-06: besides S3, media can live on a NAS behind a small HTTP API (`STORAGE_DRIVER=nas`, `platform/storage/nas.ts`), used by staging. The NAS API uploads (`POST <NAS_API_URL>/upload`, form fields `key` and `file`) and deletes (`DELETE <NAS_API_URL><path>`) with a bearer token (`NAS_API_TOKEN`), and serves every file publicly at `<NAS_PUBLIC_URL><path>`. The rest of the app doesn't know which storage it has: the driver fills the same `Storage` contract.

| Storage operation | With the NAS |
| --- | --- |
| Browser upload (`presignPut`, multipart parts) | The browser can't hold the NAS token, so the signed upload links point at our API: `PUT /api/storage/upload/<token>` (an HMAC with `AUTH_SECRET` under its own label naming the key, and for single uploads the exact type and size; 15 minutes, parts 1 hour). The body waits in `STORAGE_TEMP_DIR` (default the OS temp folder) on the API host; the answer carries the part's ETag, as S3's does. A single upload goes to the NAS at once; multipart parts are kept until `complete`, which checks every part's ETag and sends the joined file in one request |
| Server writes (`put`: thumbnails, converted images) | Sent straight to the NAS |
| `head` (size, type) | From `StoredObject`, a table of what the driver has stored (key, NAS path, size, type): the NAS can't report it |
| `presignGet`, `getBytes` | The public NAS URL: **no expiry** (decided 2026-10-06 for staging). Paths contain random ids, so they can't be guessed, but a link that is shared stays valid |
| `delete`, `deletePrefix` | `DELETE` per file; a folder is deleted key by key from `StoredObject` (the NAS can't delete a folder) |
| `ping` (`/api/health`) | `GET <NAS origin>/health` |

- Sending to the NAS is tried up to 3 times (0.5 s and 1.5 s apart) when it can't connect or answers 5xx: on staging it refused a connection for a moment under load (2026-10-06). A 4xx is final; the NAS refuses a file whose name extension doesn't match its type (415), which can't happen with our keys.
- Uploads route through the API host, so it carries every uploaded byte and needs disk for files in flight (up to 1 GB per video, until `complete`). Abandoned multipart uploads are removed by `media-purge` (`abortMultipart` deletes their parts).
- `NAS_API_URL` may be plain HTTP (staging uses `http://<ip>:8119/<bucket>`, since Cloudflare in front of the NAS's domain caps a request at 100 MB): the token and files then cross the network unencrypted. Accepted for staging on 2026-10-06; production needs HTTPS.
- The browser reaches the upload route on the app's own origin, so no CORS rule is needed; it's rate-limited per IP (600 a minute) and needs no session, like a presigned S3 URL.

## Delivering media to networks (P1-B8)
Networks get a post's files in one of two ways, chosen per network by the adapter:

| Way | Used for | Needs |
| --- | --- | --- |
| **Upload**: the worker reads the file from storage (a signed storage URL) and sends the bytes | Facebook photos (`source`), Facebook videos (chunked upload, each chunk a byte range), Instagram videos of accounts reached through a Page (`rupload.facebook.com`) | Nothing public: works with local MinIO |
| **Fetch**: the network downloads it from a signed public address | Instagram images (Meta offers no upload for them), Instagram videos of Instagram Login accounts; TikTok (phase 3, domain-verified prefix) | `MEDIA_PUBLIC_URL` |

- Each prepared file carries `readUrl` (signed storage URL, 2 hours, for the worker) and `publicUrl` (null when `MEDIA_PUBLIC_URL` is unset). Uploading is preferred wherever the network allows it: nothing has to be reachable from the internet and no fetched link can expire.
- Public addresses: `<MEDIA_PUBLIC_URL>/<payload>.<signature>.<ext>`. The payload names the stored file and an expiry (24 hours); the signature is an HMAC with `AUTH_SECRET` under its own label, so addresses can't be guessed or altered. The API serves them at `GET /public-media/:file`, streaming from storage with `Range` support (206) and `HEAD`, rate-limited per IP; anything forged, expired or missing is a bare 404.
- Production points `media.<domain>` at the API's `/public-media` ([infra](../../infra.md)); a developer sets `MEDIA_PUBLIC_URL` to their tunnel, e.g. `https://dev1.dev.socioboard.com/public-media`.
- Without `MEDIA_PUBLIC_URL`, posts that need it fail with `media_public_url_missing` and a plain message instead of a network error.
- Development shortcut: when the bucket is publicly readable through a CDN, `STORAGE_PUBLIC_URL` makes networks fetch `<STORAGE_PUBLIC_URL>/<key>` directly (unsigned; the API logs a warning). `MEDIA_PUBLIC_URL` wins when both are set; production keeps storage private.
