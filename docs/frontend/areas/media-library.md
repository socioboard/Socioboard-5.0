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

**Built in P0-F7** (`features/media`):
- Header: search by name (as you type, sent after a pause) and Upload; filters for type (image, GIF, video) and source (uploaded, AI); folder chips (all, not in a folder, each folder; create in a popover, rename and delete from the selected chip's menu; deleting moves its contents up). Folder, filters and the open asset live in the URL (`?folder=&kind=&source=&q=&asset=`), so a view can be shared.
- Uploads: button, or drop anywhere on the page. Type and size are checked against the API's limits first (the refusal shows the limit). Files upload two at a time, straight to storage with progress (one PUT up to 16 MB, else 16 MB parts three at a time); each shows as a tile first in the grid, with Retry or Dismiss when it fails. Uploads keep going while people move around the app. Uploading with a folder open puts the files in it.
- Grid: thumbnails (the file name names each tile; the image's alt text is for posts), video length and GIF/AI badges; "Processing…" until the server marks it ready. Until live updates arrive (P2-F5), the grid and the open details re-ask every 3 s while anything is processing. Infinite scroll with a "Load more" button.
- Details drawer: preview from the signed URL (video plays in place), type, size, dimensions, length, who uploaded it and when; name, alt text (images and GIFs) and folder for people who can upload; "Open original" (a new tab, since browsers ignore download links to another origin) and delete. "Used in posts" and "Use in new post" come with posts (phase 1).
