// Read side of the training log, for the Rowing page now and the training
// dashboard later (specification 2, "Training dashboard: designed separately").
//
// Everything here counts only sessions marked visible, so warm-ups,
// cool-downs and anything Samuel hides stay out. Periods follow the calendar
// in Copenhagen: weeks start on Monday.
//
//   getTrainingSummary(now?)        this week, this month and this season
//   getTotals({ from, to })         totals for any period
//   getDailyTotals({ from, to })    one row per day with training, for charts
//   getSessions({ page, ... })      the session list, newest first
//   getSeasonStart(now?)            when the current season began
//
// Results are plain JSON-safe objects (numbers and ISO strings), so they can
// be passed to client components and chart libraries as they are.

import "server-only";
import { cache } from "react";
import { and, count, desc, eq, gte, inArray, lt, sql, sum } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { getAllSettings } from "@/lib/data";
import { zonedToUtc, LOCAL_ZONE } from "./parse/util";
import type { Sport } from "./types";

export type Totals = {
  sessions: number;
  /** Hours, to one decimal. */
  hours: number;
  /** Kilometres, to one decimal. */
  kilometres: number;
};

export type Period = { from: Date; to: Date };

export type TrainingSummary = {
  week: Totals;
  month: Totals;
  season: Totals;
  /** ISO date (YYYY-MM-DD) the season started on. */
  seasonStart: string;
};

/** A session as the public site may show it. */
export type PublicSession = {
  id: number;
  startTime: string;
  sport: Sport;
  durationS: number;
  distanceM: number | null;
  avgSplitSPer500: number | null;
  avgRate: number | null;
  avgHr: number | null;
};

export type SessionPage = {
  sessions: PublicSession[];
  page: number;
  pageCount: number;
  total: number;
};

export const PAGE_SIZE = 20;

const t = schema.trainingSessions;
const empty: Totals = { sessions: 0, hours: 0, kilometres: 0 };

/** Today's date in Copenhagen as [year, month (1–12), day, weekday (Monday = 0)]. */
function localToday(now: Date): [number, number, number, number] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: LOCAL_ZONE, year: "numeric", month: "numeric", day: "numeric", weekday: "short" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday);
  return [+parts.year, +parts.month, +parts.day, weekday];
}

/** Midnight in Copenhagen on a local date (days may run over a month; Date.UTC normalises them). */
function localMidnight(year: number, month: number, day: number): Date {
  const normal = new Date(Date.UTC(year, month - 1, day));
  return zonedToUtc(normal.getUTCFullYear(), normal.getUTCMonth() + 1, normal.getUTCDate(), 0, 0, 0);
}

/** The season start ("MM-DD" in settings) on or before today. */
export async function getSeasonStart(now = new Date()): Promise<Date> {
  const { seasonStart } = await getAllSettings();
  const match = /^(\d{2})-(\d{2})$/.exec(seasonStart ?? "");
  const [month, day] = match ? [Number(match[1]), Number(match[2])] : [9, 1];
  const [year] = localToday(now);
  const thisYear = localMidnight(year, month, day);
  return thisYear <= now ? thisYear : localMidnight(year - 1, month, day);
}

export async function getTotals({ from, to }: Period): Promise<Totals> {
  if (!hasDatabase) return empty;
  const [row] = await db
    .select({ sessions: count(), seconds: sum(t.durationS), metres: sum(t.distanceM) })
    .from(t)
    .where(and(eq(t.visible, true), gte(t.startTime, from), lt(t.startTime, to)));
  return {
    sessions: row.sessions,
    hours: Math.round(Number(row.seconds ?? 0) / 360) / 10,
    kilometres: Math.round(Number(row.metres ?? 0) / 100) / 10,
  };
}

export const getTrainingSummary = cache(async (now: Date = new Date()): Promise<TrainingSummary> => {
  const [year, month, day, weekday] = localToday(now);
  const end = new Date(now.getTime() + 1);
  const seasonStart = await getSeasonStart(now);
  const [week, monthTotals, season] = await Promise.all([
    getTotals({ from: localMidnight(year, month, day - weekday), to: end }),
    getTotals({ from: localMidnight(year, month, 1), to: end }),
    getTotals({ from: seasonStart, to: end }),
  ]);
  const local = new Intl.DateTimeFormat("en-CA", { timeZone: LOCAL_ZONE }).format(seasonStart);
  return { week, month: monthTotals, season, seasonStart: local };
});

/** One row per Copenhagen day with visible training, oldest first. */
export async function getDailyTotals({ from, to }: Period): Promise<(Totals & { date: string })[]> {
  if (!hasDatabase) return [];
  // The zone is a constant from this code, written into the SQL so the
  // grouping and the selected column are the same expression.
  const day = sql<string>`to_char(${t.startTime} at time zone ${sql.raw(`'${LOCAL_ZONE}'`)}, 'YYYY-MM-DD')`;
  const rows = await db
    .select({ date: day, sessions: count(), seconds: sum(t.durationS), metres: sum(t.distanceM) })
    .from(t)
    .where(and(eq(t.visible, true), gte(t.startTime, from), lt(t.startTime, to)))
    .groupBy(day)
    .orderBy(day);
  return rows.map((r) => ({
    date: r.date,
    sessions: r.sessions,
    hours: Math.round(Number(r.seconds ?? 0) / 360) / 10,
    kilometres: Math.round(Number(r.metres ?? 0) / 100) / 10,
  }));
}

/** Visible sessions, newest first, a page at a time (pages start at 1). */
export async function getSessions({
  page = 1,
  pageSize = PAGE_SIZE,
  sports,
}: { page?: number; pageSize?: number; sports?: Sport[] } = {}): Promise<SessionPage> {
  if (!hasDatabase) return { sessions: [], page: 1, pageCount: 0, total: 0 };
  const where = and(eq(t.visible, true), sports?.length ? inArray(t.sport, sports) : undefined);
  const [{ total }] = await db.select({ total: count() }).from(t).where(where);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount);
  const rows = await db
    .select({
      id: t.id,
      startTime: t.startTime,
      sport: t.sport,
      durationS: t.durationS,
      distanceM: t.distanceM,
      avgSplitSPer500: t.avgSplitSPer500,
      avgRate: t.avgRate,
      avgHr: t.avgHr,
    })
    .from(t)
    .where(where)
    .orderBy(desc(t.startTime), desc(t.id))
    .limit(pageSize)
    .offset((current - 1) * pageSize);
  return {
    sessions: rows.map((r) => ({ ...r, startTime: r.startTime.toISOString(), sport: r.sport as Sport })),
    page: current,
    pageCount,
    total,
  };
}
