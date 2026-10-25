// The import rules from specification 5.6, in one place.

import type { ParsedSession, Sport } from "./types";

/** Sessions shorter than this are hidden automatically as likely warm-ups or cool-downs. */
export const MIN_VISIBLE_SECONDS = 12 * 60;

/** "warm up", "warm-up", "cool down", "cool-down", "WU" or "CD", in any case, as words. */
const WARM_UP_COOL_DOWN = /(^|[^a-z0-9])(warm[ -]up|cool[ -]down|wu|cd)([^a-z0-9]|$)/i;

/** Why a session should start hidden, or null to show it. */
export function autoHideReason(session: Pick<ParsedSession, "durationS" | "title">): string | null {
  if (session.title && WARM_UP_COOL_DOWN.test(session.title)) return "Warm-up or cool-down (title)";
  if (session.durationS < MIN_VISIBLE_SECONDS) return "Under 12 minutes";
  return null;
}

/** Start times within 2 minutes of each other count as the same session. */
const SAME_START_MS = 2 * 60 * 1000;

/**
 * True when two sessions are the same one recorded twice, for example by the
 * erg and by Strava: they start within 2 minutes and last about as long
 * (within a minute, or 10 % for long sessions).
 */
export function isSameSession(
  a: Pick<ParsedSession, "startTime" | "durationS">,
  b: Pick<ParsedSession, "startTime" | "durationS">,
): boolean {
  const startGap = Math.abs(Date.parse(a.startTime) - Date.parse(b.startTime));
  const durationGap = Math.abs(a.durationS - b.durationS);
  return startGap <= SAME_START_MS && durationGap <= Math.max(60, 0.1 * Math.max(a.durationS, b.durationS));
}

/** Sports with a split per 500 m. */
const SPLIT_SPORTS: Sport[] = ["row", "erg", "ski"];

/** Average split in seconds per 500 m, for rowing-type sessions with a distance. */
export function splitPer500(sport: Sport, durationS: number, distanceM: number | null): number | null {
  if (!SPLIT_SPORTS.includes(sport) || !distanceM || distanceM < 50) return null;
  return Math.round((durationS / distanceM) * 500 * 10) / 10;
}

/** Maps the many names sources use ("VirtualRow", "indoor_rowing", "Weight Training") to one sport. */
export function sportFrom(...names: (string | null | undefined)[]): Sport {
  const text = names.filter(Boolean).join(" ").toLowerCase().replace(/[_-]/g, " ");
  if (/virtual ?row|indoor ?row|rowerg|ergometer|\berg\b/.test(text)) return "erg";
  if (/skierg|nordic ski|\bski/.test(text)) return "ski";
  if (/\brow/.test(text)) return "row";
  if (/weight|strength|workout|crossfit|gym|training|hiit/.test(text)) return "strength";
  if (/\brun|jog/.test(text)) return "run";
  if (/ride|cycl|bike|biking/.test(text)) return "ride";
  if (/swim/.test(text)) return "swim";
  return "other";
}
