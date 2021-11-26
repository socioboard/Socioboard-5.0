import { CatchResponse, ValidateErrorResponse } from '../../../Common/Shared/response.shared.js';

export default (res, error) => {
  if (error.isJoi) {
    return ValidateErrorResponse(res, error.details[0].message);
  }

  if (error.statusCode) {
    let errorMessage = error.message;

    if (error.data) {
      errorMessage = JSON.parse(error.data);
    }

    return CatchResponse(res, errorMessage, null, error.statusCode);
  }

  return CatchResponse(res, error.message);
};
