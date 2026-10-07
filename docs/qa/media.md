# QA: media library

Area doc: [media-library](../frontend/areas/media-library.md) · Checks for every screen: [README](README.md#every-screen)

Allowed: JPEG, PNG, WebP, GIF (up to 20 MB), MP4 and MOV (up to 1 GB).

## Uploading
- [ ] **MEDIA-01** Upload a photo with the button → a tile appears at once with progress, then "Processing…", then the thumbnail with its size (e.g. "520 × 126").
- [ ] **MEDIA-02** Drag files from the computer anywhere onto the page → they upload.
- [ ] **MEDIA-03** Several files at once → they upload two at a time, each with its own progress.
- [ ] **MEDIA-04** A large video (over 16 MB, e.g. 100 MB) → uploads in parts with steady progress → processes → shows its length.
- [ ] **MEDIA-05** A file too large, or a type not allowed (e.g. PDF) → refused before uploading, saying the limit.
- [ ] **MEDIA-06** Turn the network off during an upload → the tile shows the failure with **Retry** and **Dismiss**; Retry finishes it.
- [ ] **MEDIA-07** Start an upload, then go to another page → it keeps going; come back and it's there.
- [ ] **MEDIA-08** With a folder open, uploads go into that folder.
- [ ] **MEDIA-09** A video finishes processing → its card updates by itself (no reload).

## Finding files
- [ ] **MEDIA-10** Search by name → results as you type (after a short pause).
- [ ] **MEDIA-11** Filters: type (image, GIF, video) and source (uploaded, AI); they combine with search.
- [ ] **MEDIA-12** Many files → scroll down → more load ("Load more" also works).
- [ ] **MEDIA-13** The folder, filters, search and an open file are in the address: copy it, open it in another tab → the same view.
- [ ] **MEDIA-14** No files, or nothing matching → an empty state saying what to do.

## Folders
- [ ] **MEDIA-20** Create a folder (the popover) → its chip appears; "Not in a folder" and "All" chips are there.
- [ ] **MEDIA-21** Rename and delete a folder from its chip's menu; deleting moves its files up, nothing is lost.
- [ ] **MEDIA-22** Move a file into a folder from its details.

## Details
- [ ] **MEDIA-30** Click a file → the details drawer: preview (videos play), type, size, dimensions, length, who uploaded it and when.
- [ ] **MEDIA-31** Edit the name and alt text (images and GIFs) → saved.
- [ ] **MEDIA-32** "Open original" → the file opens in a new tab.
- [ ] **MEDIA-33** Delete a file → confirm → it's gone from the grid.
- [ ] **MEDIA-34** Delete a file used in a scheduled post → refused, saying it's in a scheduled post.
- [ ] **MEDIA-35** As viewer: files can be seen and opened, but not uploaded, edited or deleted.

## Not built yet
AI-generated images and videos (phase 4; the "AI" filter is there but empty), alt-text suggestions, "Used in posts" and "Use in new post".
