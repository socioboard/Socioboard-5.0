import { Router } from 'express';

import type { Logger } from '../logger';
import { STORAGE_UPLOAD_PATH, UploadRefused, type Storage } from '../storage';

/**
 * PUT /api/storage/upload/:token: where browsers upload when storage takes uploads through the
 * API (the NAS driver; docs/backend/modules/media.md, "NAS storage"). The token is the signed
 * upload link from presignPut/presignPart, so it needs no session, like an S3 presigned URL; the
 * answer carries the ETag, as S3's does. Mounted before the JSON parser: the body is the file.
 */
export function createStorageUploadRouter(storage: Storage, logger: Logger): Router {
  const router = Router();
  const accept = storage.acceptUpload?.bind(storage);
  if (!accept) return router;
  router.put(`${STORAGE_UPLOAD_PATH}/:token`, async (req, res) => {
    const length = req.headers['content-length'];
    try {
      const { etag } = await accept(req.params.token, req, {
        contentType: req.headers['content-type'],
        contentLength: length === undefined ? undefined : Number(length),
      });
      res.set('ETag', etag).status(200).end();
    } catch (err) {
      if (err instanceof UploadRefused) {
        res.status(err.status).json({ error: { code: 'UPLOAD_REFUSED', message: err.message } });
        return;
      }
      logger.error({ err }, 'storage upload failed');
      res.status(502).json({
        error: { code: 'STORAGE_FAILED', message: 'Storage did not take the file; try again' },
      });
    }
  });
  return router;
}
