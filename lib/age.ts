/**
 * Samuel's age from the date of birth in admin settings (YYYY-MM-DD). Only the
 * age is ever shown, never the date itself (specification section 4).
 * Returns `null` when the date is missing or invalid.
 */
export function ageFrom(dateOfBirth: string | null | undefined, now = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth?.trim() ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  let age = now.getUTCFullYear() - year;
  const beforeBirthday =
    now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
