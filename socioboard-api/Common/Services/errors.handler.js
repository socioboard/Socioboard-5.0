export default function sendResponse(res, code, data, message, error = null) {
  return res, code, null, 'validation failed', error.details[0].message;
}
