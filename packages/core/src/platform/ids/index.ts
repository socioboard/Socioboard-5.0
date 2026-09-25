import { v7 } from 'uuid';

/** New UUIDv7 id (time-ordered), the format of every id the API exposes. */
export const newId = (): string => v7();
