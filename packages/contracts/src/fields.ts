import { z } from 'zod';

import { Id } from './common';

/** IANA timezone name (e.g. "Asia/Kolkata"), checked against the runtime's tz database. */
export const Timezone = z.string().refine(
  (tz) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Unknown timezone' },
);

/** BCP 47 language tag. English only at launch; i18n is wired from day one. */
export const Locale = z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, 'Invalid locale');

export const Email = z.email().max(254).toLowerCase();

export const PersonName = z.string().trim().min(1).max(80);

/** Response shape for anything shown as "who did this". */
export const UserSummary = z.object({
  id: Id,
  name: z.string(),
  email: z.string(),
  avatarUrl: z.url().nullable(),
});
export type UserSummary = z.infer<typeof UserSummary>;

/** Presigned single-request upload for small images (avatar, workspace logo). */
export const ImageUploadRequest = z.object({
  mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(2 * 1024 * 1024),
});
export const ImageUploadTicket = z.object({
  /** PUT the file here with the same Content-Type. */
  uploadUrl: z.url(),
  /** Pass back in the PATCH that sets the image. */
  key: z.string(),
  expiresAt: z.iso.datetime(),
});
export type ImageUploadTicket = z.infer<typeof ImageUploadTicket>;
