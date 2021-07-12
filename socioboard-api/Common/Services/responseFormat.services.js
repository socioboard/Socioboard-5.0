export default function sendResponse(res, code, data, message, error = null) {
  return (
    res
      // .status(code)
      .json({
        code: code,
        message: message,
        error: error,
        data: data,
      })
  );
}
