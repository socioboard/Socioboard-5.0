export default function sendResponse(res, code, data, message, error = null) {
  return res
    // .status(code)
    .json({
      code,
      message,
      error,
      data,
    });
}
