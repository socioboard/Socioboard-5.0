# Area: media-library

**Phase:** 0 (upload + grid), 1 (processing states, picker in composer) · **Folder:** `features/media` · **Backend:** [media](../../backend/modules/media.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/media` | Grid of assets; filters (images, videos, AI-generated, uploaded); search; folders | `media:read` |
| (drawer) | Asset details: preview, size, dimensions, duration, alt text, used-in posts, delete | `media:read` / `media:upload` |
| (dialog) | **Media picker**: same grid, used from the composer | `media:read` |

## Components
- `Uploader`: drag-and-drop or browse; multiple files; direct-to-S3 multipart upload with a progress bar per file; retry on failure.
- `AssetCard`: thumbnail, kind badge, "AI" badge for generated assets, processing spinner until `ready`.

## API calls
`POST /media/uploads` → PUT parts to presigned URLs → `POST /media/uploads/:id/complete`; `GET /media` (infinite scroll); `GET/PATCH/DELETE /media/:id`; folders CRUD.

## Behavior
- Unsupported type or too-large file is rejected before upload with the limit shown.
- Assets stay "processing" until the server marks them ready (socket event refreshes the card).
- Delete is blocked, with an explanation, when the asset is in a scheduled post.
- Alt text field suggests filling it in (AI suggestion comes later).
