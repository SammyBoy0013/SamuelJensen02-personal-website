// Single activities exported from Strava as GPX or TCX.
//
// GPX has no distance field, so the distance is added up from the track
// points while the file is read; the points themselves are then dropped. TCX
// lap totals already hold the distance, so its positions are never used.

import { XMLParser } from "fast-xml-parser";
import { sportFrom } from "../rules";
import type { ParseResult } from "../types";
import { num, positiveInt, session } from "./util";

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@", removeNSPrefix: true });
const list = <T>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

/** Metres between two points on the Earth (haversine). */
function metresBetween(a: [number, number], b: [number, number]): number {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

const average = (values: number[]) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : null);

type Point = { "@lat"?: string; "@lon"?: string; time?: string; extensions?: Record<string, unknown> };

export function parseGpx(text: string): ParseResult {
  const doc = xml.parse(text);
  const track = list(doc?.gpx?.trk)[0];
  if (!track) return { format: "GPX", sessions: [], warnings: ["No track in the GPX file."] };
  const points = list(track.trkseg).flatMap((seg: { trkpt?: Point | Point[] }) => list(seg.trkpt));
  const times = points.map((p) => Date.parse(String(p.time ?? ""))).filter((t) => !Number.isNaN(t));
  if (times.length < 2) return { format: "GPX", sessions: [], warnings: ["The GPX track has no times."] };

  // Distance, heart rate and cadence are summed here; no position is kept.
  let distanceM = 0;
  let previous: [number, number] | null = null;
  const hr: number[] = [];
  const cadence: number[] = [];
  for (const point of points) {
    const lat = num(point["@lat"]);
    const lon = num(point["@lon"]);
    if (lat !== null && lon !== null) {
      const here: [number, number] = [lat, lon];
      if (previous) distanceM += metresBetween(previous, here);
      previous = here;
    }
    const ext = JSON.stringify(point.extensions ?? {});
    const h = /"hr":"?(\d+)/.exec(ext);
    const c = /"cad":"?(\d+)/.exec(ext);
    if (h) hr.push(Number(h[1]));
    if (c) cadence.push(Number(c[1]));
  }

  const start = Math.min(...times);
  const parsed = session({
    source: "strava-file",
    externalId: new Date(start).toISOString(),
    startTime: new Date(start).toISOString(),
    sport: sportFrom(String(track.type ?? ""), String(track.name ?? "")),
    title: track.name ? String(track.name) : null,
    durationS: (Math.max(...times) - start) / 1000,
    distanceM,
    avgRate: average(cadence),
    avgHr: positiveInt(average(hr)),
    maxHr: hr.length ? Math.max(...hr) : null,
    avgWatts: null,
  });
  return { format: "GPX activity", sessions: [parsed], warnings: [] };
}

type Lap = {
  "@StartTime"?: string;
  TotalTimeSeconds?: string | number;
  DistanceMeters?: string | number;
  AverageHeartRateBpm?: { Value?: string | number };
  MaximumHeartRateBpm?: { Value?: string | number };
  Cadence?: string | number;
  Extensions?: Record<string, unknown>;
};

export function parseTcx(text: string): ParseResult {
  const doc = xml.parse(text);
  const activity = list(doc?.TrainingCenterDatabase?.Activities?.Activity)[0];
  if (!activity) return { format: "TCX", sessions: [], warnings: ["No activity in the TCX file."] };
  const laps: Lap[] = list(activity.Lap);
  const start = String(activity.Id ?? laps[0]?.["@StartTime"] ?? "");
  if (Number.isNaN(Date.parse(start)) || laps.length === 0) {
    return { format: "TCX", sessions: [], warnings: ["The TCX activity has no start time or laps."] };
  }

  // Lap totals only; track points (with their positions) are ignored.
  const seconds = laps.map((l) => num(l.TotalTimeSeconds) ?? 0);
  const durationS = seconds.reduce((s, v) => s + v, 0);
  const weighted = (pick: (l: Lap) => number | null) => {
    let sum = 0;
    let time = 0;
    laps.forEach((l, i) => {
      const v = pick(l);
      if (v !== null && v > 0) {
        sum += v * seconds[i];
        time += seconds[i];
      }
    });
    return time ? sum / time : null;
  };
  const maxHr = Math.max(0, ...laps.map((l) => num(l.MaximumHeartRateBpm?.Value) ?? 0));
  const watts = weighted((l) => num(/"AvgWatts":"?([\d.]+)/.exec(JSON.stringify(l.Extensions ?? {}))?.[1]));

  const parsed = session({
    source: "strava-file",
    externalId: new Date(start).toISOString(),
    startTime: new Date(start).toISOString(),
    sport: sportFrom(String(activity["@Sport"] ?? "")),
    title: activity.Notes ? String(activity.Notes) : null,
    durationS,
    distanceM: laps.reduce((s, l) => s + (num(l.DistanceMeters) ?? 0), 0),
    avgRate: weighted((l) => num(l.Cadence)),
    avgHr: positiveInt(weighted((l) => num(l.AverageHeartRateBpm?.Value))),
    maxHr: maxHr || null,
    avgWatts: positiveInt(watts),
  });
  return { format: "TCX activity", sessions: [parsed], warnings: [] };
}
