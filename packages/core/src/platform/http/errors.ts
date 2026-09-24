import { CommonErrorCode, type ErrorEnvelope, type ValidationDetails } from '@socioboard/contracts';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import type { Logger } from '../logger';

// Every API error uses ErrorEnvelope from @socioboard/contracts (docs/backend/README.md):
// `{ "error": { "code": "POST_NOT_FOUND", "message": "…", "details": { … } } }`.

/** An expected error: its code and message are safe to show to the client. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);
export const unauthorized = (message = 'Sign in to continue') =>
  new AppError(401, CommonErrorCode.UNAUTHENTICATED, message);
export const forbidden = (
  code: string = CommonErrorCode.FORBIDDEN,
  message = 'You do not have access to this',
) => new AppError(403, code, message);
export const notFound = (code: string, message = 'Not found') => new AppError(404, code, message);
export const conflict = (code: string, message: string, details?: unknown) =>
  new AppError(409, code, message, details);
export const unprocessable = (code: string, message: string, details?: unknown) =>
  new AppError(422, code, message, details);
export const tooManyRequests = (message = 'Too many requests, slow down') =>
  new AppError(429, CommonErrorCode.RATE_LIMITED, message);

/** 404 for any /api route nothing else handled. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    notFound(
      CommonErrorCode.ROUTE_NOT_FOUND,
      `No route for ${req.method} ${req.originalUrl.split('?')[0] ?? ''}`,
    ),
  );
};

/** Turns any thrown error into the error envelope. Unknown errors are logged and hidden. */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, _req, res, _next) => {
    // Set by the requestId middleware (P0-B3).
    const requestId: unknown = res.locals.requestId;
    let status: number;
    let error: ErrorEnvelope['error'];

    if (err instanceof AppError) {
      status = err.status;
      error = { code: err.code, message: err.message, details: err.details };
    } else if (err instanceof ZodError) {
      status = 400;
      const details: ValidationDetails = {
        issues: err.issues.map((i) => ({
          path: i.path.map((p) => (typeof p === 'number' ? p : String(p))),
          message: i.message,
        })),
      };
      error = {
        code: CommonErrorCode.VALIDATION_FAILED,
        message: 'Some fields are invalid',
        details,
      };
    } else if (isBodyParserError(err)) {
      status = err.status;
      error = { code: CommonErrorCode.INVALID_BODY, message: 'Request body could not be read' };
    } else {
      status = 500;
      error = { code: CommonErrorCode.INTERNAL_ERROR, message: 'Something went wrong on our side' };
      logger.error({ err }, 'unhandled error');
    }

    if (status >= 500 && err instanceof AppError) logger.error({ err }, err.message);
    res.status(status).json({
      error: { ...error, ...(typeof requestId === 'string' ? { requestId } : {}) },
    } satisfies ErrorEnvelope);
  };
}

function isBodyParserError(err: unknown): err is { status: number; type: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}
