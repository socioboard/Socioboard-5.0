import { z } from 'zod';

/** Every id the API exposes: UUIDv7 (time-ordered). Never sequential integers. */
export const Id = z.uuidv7();
export type Id = z.infer<typeof Id>;

/** ISO-8601 in UTC (`…Z`). The client converts to the user's or workspace's timezone. */
export const IsoDateTime = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTime>;

/** Money in minor units (cents) with an ISO 4217 currency code. */
export const Money = z.object({
  amountMinor: z.number().int(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
});
export type Money = z.infer<typeof Money>;

export const PAGE_LIMIT_DEFAULT = 25;
export const PAGE_LIMIT_MAX = 100;

/** `?cursor=<opaque>&limit=<1..100>` on every list endpoint. */
export const PageQuery = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
});
export type PageQuery = z.infer<typeof PageQuery>;

/** List response: `{ items, nextCursor }`; `nextCursor` is null on the last page. */
export function page<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Error codes are SCREAMING_SNAKE; each module adds its own (e.g. POST_NOT_FOUND). */
export const ErrorCode = z.string().regex(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/);

/** Codes produced by the platform itself, whatever the module. */
export const CommonErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_BODY: 'INVALID_BODY',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_FOUND: 'NOT_FOUND',
  REFERENCE_CONFLICT: 'REFERENCE_CONFLICT',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  ORIGIN_NOT_ALLOWED: 'ORIGIN_NOT_ALLOWED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/** `{ "error": { "code", "message", "details"?, "requestId"? } }` for every non-2xx response. */
export const ErrorEnvelope = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;

/** Details of a VALIDATION_FAILED error: which fields failed and why. */
export const ValidationDetails = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});
export type ValidationDetails = z.infer<typeof ValidationDetails>;
