// Concept2 Logbook season export (log.concept2.com → History → Export CSV).
// Dates are local wall-clock times.

import Papa from "papaparse";
import { sportFrom } from "../rules";
import type { ParseResult, ParsedSession } from "../types";
import { clockSeconds, isUsable, num, positiveInt, session, zonedToUtc } from "./util";

export function looksLikeConcept2Csv(text: string): boolean {
  const header = text.slice(0, 2000);
  return header.includes("Log ID") && header.includes("Work Time");
}

/** "2025-05-18 09:12:00" (local) as UTC ISO. */
function localDate(text: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(text.trim());
  if (!m) return null;
  return zonedToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], +(m[6] ?? 0)).toISOString();
}

export function parseConcept2Csv(text: string): ParseResult {
  const { data } = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const warnings: string[] = [];
  const sessions: ParsedSession[] = [];

  data.forEach((row, i) => {
    const startTime = localDate(row["Date"] ?? "");
    const durationS = num(row["Work Time (Seconds)"]) ?? clockSeconds(row["Work Time (Formatted)"]) ?? 0;
    if (!startTime || !row["Log ID"]) {
      warnings.push(`Row ${i + 2}: no log ID or date, skipped.`);
      return;
    }
    const sport = sportFrom(row["Type"] ?? "RowErg");
    const pace = clockSeconds(row["Pace"]);
    const parsed = session({
      source: "concept2",
      externalId: row["Log ID"].trim(),
      startTime,
      sport,
      title: row["Description"] ?? null,
      durationS,
      distanceM: num(row["Work Distance"]),
      // The erg's own pace is per 500 m for the RowErg and SkiErg.
      avgSplitSPer500: pace && sport !== "ride" ? pace : null,
      avgRate: num(row["Stroke Rate/Cadence"]),
      avgHr: positiveInt(row["Avg Heart Rate"]),
      maxHr: null,
      avgWatts: positiveInt(row["Avg Watts"]),
    });
    if (isUsable(parsed)) sessions.push(parsed);
    else warnings.push(`Row ${i + 2}: no work time, skipped.`);
  });
  return { format: "Concept2 Logbook", sessions, warnings };
}
