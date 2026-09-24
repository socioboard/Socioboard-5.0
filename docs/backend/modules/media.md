# Module: media

**Phase:** 0 (uploads) – 1 (processing) · **Path:** `packages/core/src/modules/media` · **Depends on:** platform (storage, queue), workspaces, billing (storage limit, optional)

## Purpose
The workspace media library: uploads straight from the browser to Amazon S3, metadata extraction, thumbnails, and public URLs that networks can fetch. AI-generated and discovery-imported files land here too.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `MediaAsset` | id, workspaceId, kind (image/video/gif), storageKey, mime, sizeBytes, width, height, durationSec, thumbnailKey, source (upload/ai/discovery), aiJobId?, altText?, status (pending/ready/failed), uploadedById, createdAt | Soft delete; files purged by a nightly job |
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
| CRUD | `/api/v1/workspaces/:wid/media/folders` | `media:upload` | Folders |

## Services
- `createUpload(kind, mime, size)`: validates type and size, returns presigned URLs.
- `completeUpload(assetId)`: verifies the object exists, enqueues `media-process`.
- `getPublicUrl(assetId, ttl)`: short-lived URL on `media.<domain>` for networks to fetch.
- `importFromUrl(url, source)`: used by ai and discovery.
- `prepareVariant(assetId, rules)`: resize or transcode for a network (called from publishing's `media-prepare`).

## Jobs
- `media-process`: read dimensions/duration (sharp, ffprobe), make a thumbnail, mark `ready`.
- `media-purge` (nightly): delete storage objects for soft-deleted assets older than 7 days.

## Rules
- Allowed: JPEG, PNG, WebP, GIF, MP4, MOV. Max 20 MB per image, 1 GB per video (configurable).
- Objects are private; the browser views them through signed URLs.
- Storage used counts against `checkLimit('storage')` when billing is on.
