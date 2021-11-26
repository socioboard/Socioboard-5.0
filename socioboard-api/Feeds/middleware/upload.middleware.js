import { CatchResponse } from '../../Common/Shared/response.shared.js';

export default (upload, file)  => (req, res, next) => {
  upload.single(file)(req, res, (error) => {
    if (error) {
      return CatchResponse(res, error.message);
    }

    next();
  });
}