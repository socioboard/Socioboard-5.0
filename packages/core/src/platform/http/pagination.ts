import { badRequest } from './errors';

/**
 * Keyset pagination for lists sorted newest first by (createdAt, id). The cursor is opaque to
 * clients: base64url of "<ISO time>|<id>" of the last item on the previous page.
 */
export interface CursorPosition {
  createdAt: Date;
  id: string;
}

export function encodeCursor(position: CursorPosition): string {
  return Buffer.from(`${position.createdAt.toISOString()}|${position.id}`).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPosition {
  const [iso = '', id = ''] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime()) || !/^[0-9a-f-]{36}$/.test(id)) {
    throw badRequest('INVALID_CURSOR', 'The page cursor is not valid');
  }
  return { createdAt, id };
}

/** Prisma `where` for "strictly after this position" in (createdAt desc, id desc) order. */
export function afterCursor(position: CursorPosition) {
  return {
    OR: [
      { createdAt: { lt: position.createdAt } },
      { createdAt: position.createdAt, id: { lt: position.id } },
    ],
  };
}

/** Splits a `take: limit + 1` result into the page and the next cursor. */
export function toPage<T extends CursorPosition>(rows: T[], limit: number) {
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor: rows.length > limit && last ? encodeCursor(last) : null,
  };
}
