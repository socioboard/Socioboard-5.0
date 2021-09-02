function Response(res, code, data, message, error = null) {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}
function SuccessResponse(res, data = null, message = 'Success', code = 200, error = null) {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}
function SuccessResponsePublishLimit(res, quota_left = null, message = 'Success', code = 200, error = null) {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      quota_left,
    });
}

function SuccessNavigationResponse(res, navigateUrl = null, state = null, message = 'Success', code = 200, error = null) {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      navigateUrl,
      state,
    });
}

function ValidateErrorResponse(res, error = null, code = 401, data = null, message = 'validation failed') {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}
function SocialCallbackResponse(res, navigateUrl, token = null, message, code = 200, status = 'success') {
  return res
  // .status(code)
    .json({
      code,
      status,
      message,
      navigateUrl,
      token,
    });
}
function AddSocialAccRes(res, teamDetails, profileDetails, code = 200, status = 'success') {
  return res
  // .status(code)
    .json({
      code,
      status,
      teamDetails,
      profileDetails,
    });
}
function ErrorResponse(res, error = null, code = 400, data = null, message = 'failed') {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}

function CatchResponse(res, error = null, message = 'Sorry! Something went wrong.', code = 400, data = null) {
  return res
  // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}

export {
  Response, SuccessResponse, ValidateErrorResponse, ErrorResponse, CatchResponse, SocialCallbackResponse, SuccessNavigationResponse, AddSocialAccRes,SuccessResponsePublishLimit
};
