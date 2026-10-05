import { SpanStatusCode, trace } from '@opentelemetry/api';
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
  return (err: unknown, _req, res, next) => {
    if (res.headersSent) {
      // Too late to send an error body: log it and let Express close the connection.
      logger.error({ err }, 'error after the response started');
      next(err);
      return;
    }
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
      if (err.type === 'entity.too.large') {
        status = 413;
        error = { code: CommonErrorCode.PAYLOAD_TOO_LARGE, message: 'Request body is too large' };
      } else {
        status = 400;
        error = { code: CommonErrorCode.INVALID_BODY, message: 'Request body could not be read' };
      }
    } else if (isPrismaKnownError(err) && err.code in PRISMA_ERRORS) {
      // A database constraint caught what a service check missed (usually a race): a conflict,
      // not a server failure. Logged, since the service should normally answer first.
      ({ status, error } = PRISMA_ERRORS[err.code] as {
        status: number;
        error: ErrorEnvelope['error'];
      });
      logger.warn({ err }, 'database constraint answered the request');
    } else if (isClientError(err)) {
      // Errors that carry their own 4xx status, such as Better Auth's APIError.
      status = err.statusCode;
      const code = err.body?.code;
      error = {
        code: code && /^[A-Z][A-Z0-9_]*$/.test(code) ? code : CommonErrorCode.REQUEST_REJECTED,
        message: err.body?.message ?? err.message,
      };
    } else {
      status = 500;
      error = { code: CommonErrorCode.INTERNAL_ERROR, message: 'Something went wrong on our side' };
      logger.error({ err }, 'unhandled error');
      recordException(err);
    }

    if (status >= 500 && err instanceof AppError) {
      logger.error({ err }, err.message);
      recordException(err);
    }
    res.status(status).json({
      error: { ...error, ...(typeof requestId === 'string' ? { requestId } : {}) },
    } satisfies ErrorEnvelope);
  };
}

/** A server failure, recorded on the request's span (telemetry on): an exception in OpenObserve. */
function recordException(err: unknown): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.recordException(err instanceof Error ? err : String(err));
  span.setStatus({ code: SpanStatusCode.ERROR });
}

const PRISMA_ERRORS: Record<string, { status: number; error: ErrorEnvelope['error'] }> = {
  P2002: {
    status: 409,
    error: { code: CommonErrorCode.ALREADY_EXISTS, message: 'This already exists' },
  },
  P2025: { status: 404, error: { code: CommonErrorCode.NOT_FOUND, message: 'Not found' } },
  P2003: {
    status: 409,
    error: {
      code: CommonErrorCode.REFERENCE_CONFLICT,
      message: 'It refers to something that does not exist, or something still depends on it',
    },
  },
};

function isPrismaKnownError(err: unknown): err is Error & { code: string } {
  return (
    err instanceof Error &&
    err.name === 'PrismaClientKnownRequestError' &&
    typeof (err as { code?: unknown }).code === 'string'
  );
}

function isClientError(
  err: unknown,
): err is Error & { statusCode: number; body?: { code?: string; message?: string } } {
  if (!(err instanceof Error)) return false;
  const statusCode = (err as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}

/** Errors raised by express.json() (body-parser); other errors with a `type` are not ours to relabel. */
const BODY_PARSER_TYPES = new Set([
  'entity.parse.failed',
  'entity.verify.failed',
  'entity.too.large',
  'encoding.unsupported',
  'charset.unsupported',
  'request.aborted',
  'request.size.invalid',
  'parameters.too.many',
  'stream.encoding.set',
  'stream.not.readable',
]);

function isBodyParserError(err: unknown): err is { type: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    typeof err.type === 'string' &&
    BODY_PARSER_TYPES.has(err.type)
  );
}
