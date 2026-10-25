// Training import tests: `npm test`. Each sample file in tests/fixtures is
// parsed as the admin upload does, then checked for its figures and for the
// absence of any coordinates.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { parseTrainingFile } from "../lib/training/parse";
import { stravaDate } from "../lib/training/parse/strava-csv";
import { session } from "../lib/training/parse/util";
import { sessionSchema } from "../lib/training/schema";
import { autoHideReason, isSameSession, sportFrom, splitPer500 } from "../lib/training/rules";
import type { ParsedSession } from "../lib/training/types";

const fixture = (name: string) => {
  const buffer = readFileSync(path.join(import.meta.dirname, "fixtures", name));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
};
const parse = (name: string) => parseTrainingFile(name, fixture(name));

const allowedKeys = [
  "source", "externalId", "startTime", "sport", "title", "durationS", "distanceM",
  "avgSplitSPer500", "avgRate", "avgHr", "maxHr", "avgWatts",
].sort();

/** No position survives parsing: only the summary keys, and none of the sample coordinates. */
function assertNoCoordinates(sessions: ParsedSession[]) {
  for (const s of sessions) {
    assert.deepEqual(Object.keys(s).sort(), allowedKeys);
    const json = JSON.stringify(s);
    assert.doesNotMatch(json, /"(lat|lon|lng|latitude|longitude|position[a-z_]*)"/i);
    assert.doesNotMatch(json, /0\.0001|0\.0018|0\.0002/);
  }
}

describe("Strava bulk export", () => {
  it("reads activities.csv", async () => {
    const { format, sessions, warnings } = await parse("strava-activities.csv");
    assert.equal(format, "Strava bulk export");
    assert.deepEqual(warnings, []);
    assert.equal(sessions.length, 5);
    const [row] = sessions;
    assert.equal(row.source, "strava");
    assert.equal(row.externalId, "9000000001");
    assert.equal(row.startTime, "2025-10-20T06:01:41.000Z");
    assert.equal(row.sport, "row");
    assert.equal(row.durationS, 3600, "moving time");
    assert.equal(row.distanceM, 12040, "the second Distance column, in metres");
    assert.equal(row.avgSplitSPer500, 149.5);
    assert.equal(row.avgHr, 148);
    assert.equal(row.maxHr, 172);
    assert.equal(row.avgRate, 22);
    assert.equal(sessions[2].sport, "erg", "VirtualRow");
    assert.equal(sessions[3].sport, "strength");
    assert.equal(sessions[3].distanceM, null);
    assertNoCoordinates(sessions);
  });

  it("reads only activities.csv from the account zip", async () => {
    const { sessions } = await parse("strava-export.zip");
    assert.equal(sessions.length, 5);
    assertNoCoordinates(sessions);
  });
});

describe("Concept2 Logbook", () => {
  it("reads the season CSV in local time", async () => {
    const { format, sessions } = await parse("concept2-season.csv");
    assert.equal(format, "Concept2 Logbook");
    assert.equal(sessions.length, 3);
    const [sixK, twoK, ski] = sessions;
    assert.equal(sixK.startTime, "2025-11-25T06:00:00.000Z", "07:00 in Copenhagen (CET)");
    assert.equal(twoK.startTime, "2025-10-21T17:30:20.000Z", "19:30 in Copenhagen (CEST)");
    assert.equal(sixK.durationS, 1299);
    assert.equal(sixK.distanceM, 6000);
    assert.equal(sixK.avgSplitSPer500, 108.2, "the erg's own pace");
    assert.equal(sixK.avgWatts, 276);
    assert.equal(sixK.sport, "erg");
    assert.equal(ski.sport, "ski");
    assertNoCoordinates(sessions);
  });
});

describe("NK SpeedCoach", () => {
  it("reads the session summary and never the per-stroke GPS", async () => {
    const { format, sessions } = await parse("nk-session.csv");
    assert.equal(format, "NK SpeedCoach");
    assert.equal(sessions.length, 1);
    const [s] = sessions;
    assert.equal(s.source, "nk");
    assert.equal(s.startTime, "2025-10-24T05:30:00.000Z", "07:30 in Copenhagen (CEST)");
    assert.equal(s.durationS, 3000);
    assert.equal(s.distanceM, 11200, "GPS distance");
    assert.equal(s.avgSplitSPer500, 133.9);
    assert.equal(s.avgRate, 19.5);
    assert.equal(s.avgHr, 145);
    assert.equal(s.avgWatts, null, "--- means no power meter");
    assert.equal(s.title, "Steady state");
    assertNoCoordinates(sessions);
  });
});

describe("Single activities", () => {
  it("reads GPX: distance from the track, then no points kept", async () => {
    const { sessions } = await parse("activity.gpx");
    assert.equal(sessions.length, 1);
    const [s] = sessions;
    assert.equal(s.source, "strava-file");
    assert.equal(s.startTime, "2025-10-25T07:00:00.000Z");
    assert.equal(s.durationS, 3000);
    assert.ok(Math.abs((s.distanceM ?? 0) - 10008) < 20, `about 10 km, got ${s.distanceM}`);
    assert.equal(s.sport, "row");
    assert.equal(s.title, "Saturday long row");
    assert.equal(s.avgRate, 20);
    assert.equal(s.maxHr, 149);
    assertNoCoordinates(sessions);
  });

  it("reads TCX lap totals", async () => {
    const { sessions } = await parse("activity.tcx");
    const [s] = sessions;
    assert.equal(s.durationS, 2400);
    assert.equal(s.distanceM, 9800);
    assert.equal(s.avgHr, 145, "time-weighted over the laps");
    assert.equal(s.maxHr, 165);
    assert.equal(s.avgRate, 21);
    assertNoCoordinates(sessions);
  });

  it("reads the FIT session message", async () => {
    const { sessions } = await parse("activity.fit");
    const [s] = sessions;
    assert.equal(s.startTime, "2025-10-27T17:00:00.000Z");
    assert.equal(s.durationS, 2700);
    assert.equal(s.distanceM, 10000);
    assert.equal(s.sport, "erg", "rowing, indoor_rowing");
    assert.equal(s.avgHr, 141);
    assert.equal(s.maxHr, 160);
    assert.equal(s.avgWatts, 210);
    assert.equal(s.avgSplitSPer500, 135);
    assertNoCoordinates(sessions);
  });

  it("refuses other files", async () => {
    const { sessions, warnings } = await parseTrainingFile("notes.txt", new ArrayBuffer(4));
    assert.equal(sessions.length, 0);
    assert.equal(warnings.length, 1);
  });
});

describe("Rules", () => {
  it("auto-hides warm-ups, cool-downs and short sessions", () => {
    const long = 30 * 60;
    for (const title of ["Warm up", "warm-up row", "COOL DOWN", "Cool-down jog", "WU", "2k + CD"]) {
      assert.ok(autoHideReason({ title, durationS: long }), title);
    }
    for (const title of ["Morning row", "Wuhan", "CDs and coffee", "Steady state", null]) {
      assert.equal(autoHideReason({ title, durationS: long }), null, String(title));
    }
    assert.equal(autoHideReason({ title: "2k test", durationS: 400 }), "Under 12 minutes");
    assert.equal(autoHideReason({ title: "Row", durationS: 12 * 60 }), null, "exactly 12 minutes stays");
  });

  it("finds the same session from two sources", async () => {
    const strava = (await parse("strava-activities.csv")).sessions[2];
    const concept2 = (await parse("concept2-season.csv")).sessions[1];
    assert.ok(isSameSession(strava, concept2), "the 2k: 20 s apart, same length");
    const shifted = { ...concept2, startTime: "2025-10-21T17:33:00.000Z" };
    assert.ok(!isSameSession(strava, shifted), "3 minutes apart");
    const longer = { ...concept2, durationS: 600 };
    assert.ok(!isSameSession(strava, longer), "a different length");
  });

  it("maps sport names and splits", () => {
    assert.equal(sportFrom("Rowing"), "row");
    assert.equal(sportFrom("rowing", "indoor_rowing"), "erg");
    assert.equal(sportFrom("RowErg"), "erg");
    assert.equal(sportFrom("BikeErg"), "ride");
    assert.equal(sportFrom("Weight Training"), "strength");
    assert.equal(splitPer500("row", 400, 2000), 100);
    assert.equal(splitPer500("run", 400, 2000), null);
  });
});

describe("Real-world export quirks", () => {
  it("reads Strava dates with a narrow no-break space before PM", () => {
    assert.equal(stravaDate("Oct 24, 2026, 6:12:34\u202fPM"), "2026-10-24T18:12:34.000Z");
    assert.equal(stravaDate("Oct 24, 2026, 6:12:34 AM"), "2026-10-24T06:12:34.000Z");
  });

  it("empties out-of-range optional figures instead of failing the upload", () => {
    const s = session({
      source: "strava", externalId: "1", startTime: "2026-10-24T06:00:00.000Z", sport: "row",
      title: "x".repeat(300), durationS: 3600.4, distanceM: 20.6, avgRate: 400,
      avgHr: 144.6, maxHr: 999, avgWatts: 212.4,
    });
    assert.equal(s.avgSplitSPer500, null); // 21 m in an hour would be a split of over 23 hours
    assert.equal(s.avgRate, null);
    assert.equal(s.avgHr, 145);
    assert.equal(s.maxHr, null);
    assert.equal(s.avgWatts, 212);
    assert.equal(s.title?.length, 200);
    assert.ok(sessionSchema.safeParse(s).success);
  });

  it("still refuses a session longer than a week", () => {
    const s = session({
      source: "strava", externalId: "2", startTime: "2026-10-24T06:00:00.000Z", sport: "ride",
      title: null, durationS: 8 * 24 * 3600, distanceM: null, avgRate: null, avgHr: null, maxHr: null, avgWatts: null,
    });
    assert.equal(sessionSchema.safeParse(s).success, false);
  });
});
