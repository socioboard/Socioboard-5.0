import TIK_TOK_CONSTANTS from '../../../Common/Constants/tiktok.constants.js';
import {
  CatchResponse,
  ValidateErrorResponse,
} from '../../../Common/Shared/response.shared.js';

/**
 * TikTok filter exception
 * @module
 * @param {express.Response} res - Express response
 * @param {object} error - Error object
 * @return {void}
 */
export default (res, error) => {
  if (error.isJoi) {
    return ValidateErrorResponse(res, error.details[0].message);
  }

  if (error.isAxiosError) {
    const statusCode = error?.response?.status;

    const statusText = error?.response?.statusText;

    const errorDetails = error?.response?.data?.error ?? error;

    const errorMessage = TIK_TOK_CONSTANTS.REMOTE_ERRORS[errorDetails?.code] ?? null;

    if (errorMessage) {
      return CatchResponse(res, errorMessage, null, statusCode);
    }

    return CatchResponse(res, statusText, null, statusCode);
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
