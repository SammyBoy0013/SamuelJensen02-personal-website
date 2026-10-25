// Strava bulk export: activities.csv from "Download your account" (Settings →
// My Account). It has no coordinates. Some column names appear twice: the
// first "Distance" is in kilometres, the second in metres.

import Papa from "papaparse";
import { sportFrom } from "../rules";
import type { ParseResult, ParsedSession } from "../types";
import { clockSeconds, isUsable, num, positiveInt, session } from "./util";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Oct 20, 2025, 6:01:41 AM" (UTC, as Strava writes it) or ISO 8601. */
export function stravaDate(text: string): string | null {
  // Newer exports put a narrow no-break space (U+202F) before AM/PM.
  const m = /^([A-Za-z]{3})[a-z]*\.?\s(\d{1,2}),\s(\d{4}),?\s(\d{1,2}):(\d{2}):(\d{2})\s?([AP]M)$/i.exec(
    text.replace(/[\u00a0\u202f]/g, " ").trim(),
  );
  if (m) {
    const month = MONTHS.indexOf(m[1].toLowerCase());
    let hour = Number(m[4]) % 12;
    if (m[7].toUpperCase() === "PM") hour += 12;
    if (month < 0) return null;
    return new Date(Date.UTC(+m[3], month, +m[2], hour, +m[5], +m[6])).toISOString();
  }
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function looksLikeStravaCsv(text: string): boolean {
  const header = text.slice(0, 2000);
  return header.includes("Activity ID") && header.includes("Activity Date");
}

export function parseStravaCsv(text: string): ParseResult {
  const { data } = Papa.parse<string[]>(text.replace(/^﻿/, ""), { skipEmptyLines: true });
  const [header, ...rows] = data;
  const warnings: string[] = [];
  if (!header) return { format: "Strava bulk export", sessions: [], warnings: ["The file is empty."] };

  const all = (name: string) => header.flatMap((h, i) => (h.trim() === name ? [i] : []));
  const first = (name: string) => all(name)[0] ?? -1;
  const col = {
    id: first("Activity ID"),
    date: first("Activity Date"),
    name: first("Activity Name"),
    type: first("Activity Type"),
    elapsed: first("Elapsed Time"),
    moving: first("Moving Time"),
    maxHr: first("Max Heart Rate"),
    avgHr: first("Average Heart Rate"),
    watts: first("Average Watts"),
    cadence: first("Average Cadence"),
  };
  const distance = all("Distance");

  const sessions: ParsedSession[] = [];
  rows.forEach((row, i) => {
    const startTime = stravaDate(row[col.date] ?? "");
    const moving = clockSeconds(row[col.moving]);
    const elapsed = clockSeconds(row[col.elapsed]);
    const durationS = moving && moving > 0 ? moving : (elapsed ?? 0);
    // Two "Distance" columns: the second is in metres. One: kilometres.
    const distanceM = distance.length > 1 ? num(row[distance[1]]) : (num(row[distance[0]]) ?? 0) * 1000;
    if (!startTime || !row[col.id]) {
      warnings.push(`Row ${i + 2}: no activity ID or date, skipped.`);
      return;
    }
    const parsed = session({
      source: "strava",
      externalId: row[col.id].trim(),
      startTime,
      sport: sportFrom(row[col.type]),
      title: row[col.name] ?? null,
      durationS,
      distanceM,
      avgRate: num(row[col.cadence]),
      avgHr: positiveInt(row[col.avgHr]),
      maxHr: positiveInt(row[col.maxHr]),
      avgWatts: positiveInt(row[col.watts]),
    });
    if (isUsable(parsed)) sessions.push(parsed);
    else warnings.push(`Row ${i + 2}: no duration, skipped.`);
  });
  return { format: "Strava bulk export", sessions, warnings };
}
