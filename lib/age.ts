/**
 * Samuel's age from `DATE_OF_BIRTH` (YYYY-MM-DD). Only the age is ever shown,
 * never the date itself (specification section 4). Phase 3 moves the date into
 * admin settings. Returns `null` when the variable is missing or invalid.
 */
export function getAge(now = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(process.env.DATE_OF_BIRTH?.trim() ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  let age = now.getUTCFullYear() - year;
  const beforeBirthday =
    now.getUTCMonth() + 1 < month || (now.getUTCMonth() + 1 === month && now.getUTCDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
