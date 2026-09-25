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

## Services
- `createUpload(kind, mime, size)`: validates type and size, returns presigned URLs.
- `completeUpload(assetId)`: verifies the object exists, enqueues `media-process`.
- `getPublicUrl(assetId, ttl)`: short-lived URL on `media.<domain>` for networks to fetch.
- `importFromUrl(url, source)`: used by ai and discovery.
- `prepareVariant(assetId, rules)`: resize or transcode for a network (called from publishing's `media-prepare`).

## Jobs
- `media-process` (P0-B6): images and GIFs through sharp (dimensions as displayed, EXIF rotation applied; first frame of GIFs); videos through ffprobe (dimensions, duration) and ffmpeg (a frame 1 s in), both reading a signed URL so large files never load into memory. Stores a 480 px WebP thumbnail and marks the asset `ready`. 3 attempts with backoff; after the last it marks the asset `failed`. One job per asset (job id `media-<assetId>`). Without ffprobe/ffmpeg (`FFPROBE_PATH`, `FFMPEG_PATH`) videos become `ready` without duration or thumbnail and the worker logs a warning.
- `media-purge` (nightly): delete storage objects for soft-deleted assets older than 7 days.

## Rules
- Files live under `workspaces/<workspaceId>/media/<assetId>/` (`original.<ext>`, `thumb.webp`), so a workspace's files share one prefix.
- Uploads up to 16 MB use one presigned PUT locked to the declared size and type; larger files use multipart (16 MB parts). `complete` checks the stored object's size and type against what was declared (else 422 `UPLOAD_INVALID` and the asset is `failed`), and only one `complete` moves it to `processing`.
- Deleting is soft; phase 1 adds the "used by a scheduled post" block (`MEDIA_IN_USE`) and `media-purge` for the stored files.
- Error codes: `STORAGE_NOT_CONFIGURED`, `MEDIA_NOT_FOUND`, `FOLDER_NOT_FOUND`, `FOLDER_CYCLE`, `UPLOAD_ALREADY_COMPLETED`, `PARTS_REQUIRED`, `UPLOAD_INCOMPLETE`, `UPLOAD_INVALID`, `INVALID_CURSOR`.
- Allowed: JPEG, PNG, WebP, GIF, MP4, MOV. Max 20 MB per image, 1 GB per video (configurable).
- Objects are private; the browser views them through signed URLs.
- Storage used counts against `checkLimit('storage')` when billing is on.
