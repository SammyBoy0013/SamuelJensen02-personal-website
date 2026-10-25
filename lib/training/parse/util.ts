// Small helpers shared by the parsers.

import { splitPer500 } from "../rules";
import type { ParsedSession, Sport } from "../types";

/** Concept2 and NK write local times; Samuel trains in Denmark. */
export const LOCAL_ZONE = "Europe/Copenhagen";

/** A number from a CSV cell ("1,234.5", " 152 ", ""), or null. */
export function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(/,(?=\d{3}(\D|$))/g, "");
  if (!text || text === "--" || text === "-") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** A positive whole number, or null (zero usually means "not recorded"). */
export function positiveInt(value: unknown): number | null {
  const n = num(value);
  return n !== null && n > 0 ? Math.round(n) : null;
}

/** "1:02:03.4", "45:12" or "92.5" as seconds. */
export function clockSeconds(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(text)) return null;
  return text.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

/** The UTC instant of a wall-clock time in a time zone. */
export function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, zone = LOCAL_ZONE): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  // The zone's offset at that moment, read back through Intl.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(guess))
      .map((p) => [p.type, p.value]),
  );
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return new Date(guess - (asLocal - guess));
}

/** Builds a session, filling in the split and rounding the figures. */
export function session(fields: Omit<ParsedSession, "avgSplitSPer500"> & { avgSplitSPer500?: number | null }): ParsedSession {
  const durationS = Math.round(fields.durationS);
  const distanceM = fields.distanceM === null ? null : Math.round(fields.distanceM);
  return {
    source: fields.source,
    externalId: fields.externalId,
    startTime: fields.startTime,
    sport: fields.sport,
    title: fields.title?.trim() || null,
    durationS,
    distanceM: distanceM && distanceM > 0 ? distanceM : null,
    avgSplitSPer500: fields.avgSplitSPer500 ?? splitPer500(fields.sport as Sport, durationS, distanceM),
    avgRate: fields.avgRate === null ? null : Math.round(fields.avgRate * 10) / 10,
    avgHr: fields.avgHr,
    maxHr: fields.maxHr,
    avgWatts: fields.avgWatts,
  };
}

/** True for a usable session: a real start time and some duration. */
export function isUsable(s: ParsedSession): boolean {
  return !Number.isNaN(Date.parse(s.startTime)) && s.durationS > 0;
}
