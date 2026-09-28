export type Strength = 'weak' | 'fair' | 'strong';

/**
 * A guide, not a gate: the server enforces 10–128 characters and rejects breached passwords.
 * Length matters most; a mix of character types helps shorter passwords.
 */
export function passwordStrength(password: string): Strength {
  if (password.length < 10) return 'weak';
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password),
  ).length;
  const words = password.trim().split(/\s+/).length;
  if (password.length >= 16 || words >= 4 || (password.length >= 12 && kinds >= 3)) return 'strong';
  return 'fair';
}
