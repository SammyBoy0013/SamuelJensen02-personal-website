// NK SpeedCoach session export from NK LiNK Logbook (CSV). The file has a
// "Session Information" block, a "Session Summary" block and per-stroke data.
// Only the first two are read: the per-stroke rows carry the GPS latitude and
// longitude, and are never looked at.

import Papa from "papaparse";
import type { ParseResult } from "../types";
import { clockSeconds, num, positiveInt, session, zonedToUtc } from "./util";

export function looksLikeNkCsv(text: string): boolean {
  const head = text.slice(0, 4000);
  return /Session Summary/i.test(head) && /Start Time/i.test(head);
}

/** "10/12/2025 07:30 AM", "10/12/2025 19:30" or ISO 8601 (local time) as UTC ISO. */
function nkDate(text: string): string | null {
  const t = text.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))? ?([AP]M)?$/i.exec(t);
  if (us) {
    let hour = Number(us[4]);
    if (us[7]) hour = (hour % 12) + (us[7].toUpperCase() === "PM" ? 12 : 0);
    return zonedToUtc(+us[3], +us[1], +us[2], hour, +us[5], +(us[6] ?? 0)).toISOString();
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(t);
  if (iso) return zonedToUtc(+iso[1], +iso[2], +iso[3], +iso[4], +iso[5], +(iso[6] ?? 0)).toISOString();
  return null;
}

export function parseNkCsv(text: string): ParseResult {
  const { data } = Papa.parse<string[]>(text.replace(/^﻿/, ""), { skipEmptyLines: false });
  const cell = (row: string[] | undefined, i: number) => (row?.[i] ?? "").trim();
  const format = "NK SpeedCoach";

  // Stop before the per-stroke data: nothing below that line is read.
  const strokeStart = data.findIndex((row) => /per-stroke data/i.test(cell(row, 0)));
  const rows = strokeStart >= 0 ? data.slice(0, strokeStart) : data;

  const info = (label: RegExp) => {
    const row = rows.find((r) => label.test(cell(r, 0)));
    return row ? row.slice(1).find((v) => v.trim()) ?? "" : "";
  };
  const startTime = nkDate(info(/^start time/i));
  const name = info(/^name/i) || null;
  if (!startTime) return { format, sessions: [], warnings: ["No start time found in the session information."] };

  // The summary: a header row after "Session Summary", then the totals row.
  const summaryAt = rows.findIndex((row) => /session summary/i.test(cell(row, 0)));
  const headerAt = rows.findIndex((row, i) => i > summaryAt && row.some((v) => /elapsed time/i.test(v)));
  const header = rows[headerAt];
  const totals = rows.slice(headerAt + 1).find((row) => row.some((v) => v.trim()));
  if (summaryAt < 0 || !header || !totals) {
    return { format, sessions: [], warnings: ["No session summary found."] };
  }
  const value = (pattern: RegExp) => {
    const i = header.findIndex((h) => pattern.test(h.trim()));
    return i >= 0 ? cell(totals, i) : "";
  };

  const parsed = session({
    source: "nk",
    externalId: startTime,
    startTime,
    sport: "row",
    title: name,
    durationS: clockSeconds(value(/^elapsed time/i)) ?? 0,
    distanceM: num(value(/^distance \(gps\)/i)) ?? num(value(/^distance \(imp\)/i)),
    avgSplitSPer500: clockSeconds(value(/^avg split \(gps\)/i)) ?? clockSeconds(value(/^avg split \(imp\)/i)),
    avgRate: num(value(/^avg stroke rate/i)),
    avgHr: positiveInt(value(/^avg heart rate/i)),
    maxHr: null,
    avgWatts: positiveInt(value(/^avg power/i)),
  });
  return parsed.durationS > 0
    ? { format, sessions: [parsed], warnings: [] }
    : { format, sessions: [], warnings: ["No elapsed time in the session summary."] };
}
