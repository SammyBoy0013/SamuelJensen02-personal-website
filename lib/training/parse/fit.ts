// Single activities exported from Strava (or a watch) as .fit. Only the
// session message is read; the per-second records, which hold positions,
// are left behind with the parser.

import FitParser from "fit-file-parser";
import { sportFrom } from "../rules";
import type { ParseResult } from "../types";
import { positiveInt, session } from "./util";

export async function parseFit(bytes: ArrayBuffer): Promise<ParseResult> {
  const parser = new FitParser({ force: true, mode: "list", lengthUnit: "m", speedUnit: "m/s" });
  const fit = await parser.parseAsync(bytes);
  const summary = fit.sessions?.[0];
  if (!summary?.start_time) return { format: "FIT activity", sessions: [], warnings: ["No session in the FIT file."] };

  const start = new Date(summary.start_time).toISOString();
  const parsed = session({
    source: "strava-file",
    externalId: start,
    startTime: start,
    sport: sportFrom(String(summary.sport ?? ""), String(summary.sub_sport ?? "")),
    title: summary.sport_profile_name ?? null,
    durationS: summary.total_timer_time ?? summary.total_elapsed_time ?? 0,
    distanceM: summary.total_distance ?? null,
    avgRate: summary.avg_cadence ?? null,
    avgHr: positiveInt(summary.avg_heart_rate),
    maxHr: positiveInt(summary.max_heart_rate),
    avgWatts: positiveInt(summary.avg_power),
  });
  return { format: "FIT activity", sessions: parsed.durationS > 0 ? [parsed] : [], warnings: [] };
}
