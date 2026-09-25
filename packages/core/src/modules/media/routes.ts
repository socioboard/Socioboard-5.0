import { mediaRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { MediaService } from './service';

/** Mounts the media routes (contracts: mediaRoutes); folder routes come before /media/:assetId. */
export function registerMediaRoutes(api: ApiRouter, media: MediaService) {
  api.route(r.createUpload, ({ auth, member, body }) => media.createUpload(auth, member, body));
  api.route(r.completeUpload, ({ member, params, body }) =>
    media.completeUpload(member, params.assetId, body.parts),
  );

  api.route(r.listFolders, async ({ member }) => ({ items: await media.listFolders(member) }));
  api.route(r.createFolder, ({ member, body }) => media.createFolder(member, body));
  api.route(r.updateFolder, ({ member, params, body }) =>
    media.updateFolder(member, params.folderId, body),
  );
  api.route(r.deleteFolder, ({ member, params }) => media.deleteFolder(member, params.folderId));

  api.route(r.listMedia, ({ member, query }) => media.list(member, query));
  api.route(r.getMedia, ({ member, params }) => media.get(member, params.assetId));
  api.route(r.updateMedia, ({ member, params, body }) =>
    media.update(member, params.assetId, body),
  );
  api.route(r.deleteMedia, ({ auth, member, params }) =>
    media.remove(auth, member, params.assetId),
  );
}
