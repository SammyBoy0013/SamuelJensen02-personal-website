// Server side of a training upload: compares parsed sessions with what is
// stored (preview), then saves the new ones (import). Specification 5.6.

import "server-only";
import { and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { autoHideReason, isSameSession } from "./rules";
import { sources, sports, type ParsedSession, type PreviewRow } from "./types";

/** At most this many sessions per request; the upload form sends larger files in parts. */
export const BATCH_SIZE = 2000;

const count = z.number().int().min(0).max(1_000_000).nullable();

/**
 * One session as the browser sends it. `.strict()` refuses any field that is
 * not a summary figure, so no coordinates can reach the database.
 */
export const sessionSchema = z
  .object({
    source: z.enum(sources),
    externalId: z.string().trim().min(1).max(100),
    startTime: z.iso.datetime(),
    sport: z.enum(sports),
    title: z.string().trim().max(200).nullable(),
    durationS: z.number().int().positive().max(7 * 24 * 3600),
    distanceM: count,
    avgSplitSPer500: z.number().positive().max(3600).nullable(),
    avgRate: z.number().min(0).max(300).nullable(),
    avgHr: z.number().int().min(20).max(250).nullable(),
    maxHr: z.number().int().min(20).max(250).nullable(),
    avgWatts: z.number().int().min(0).max(3000).nullable(),
  })
  .strict();

export const batchSchema = z.array(sessionSchema).min(1).max(BATCH_SIZE);

const SAME_START_MS = 2 * 60 * 1000;

/** Stored sessions that could match anything in the batch, by start time. */
async function storedAround(sessions: ParsedSession[]) {
  const times = sessions.map((s) => Date.parse(s.startTime));
  return db
    .select({
      source: schema.trainingSessions.source,
      externalId: schema.trainingSessions.externalId,
      startTime: schema.trainingSessions.startTime,
      durationS: schema.trainingSessions.durationS,
      title: schema.trainingSessions.title,
    })
    .from(schema.trainingSessions)
    .where(
      and(
        gte(schema.trainingSessions.startTime, new Date(Math.min(...times) - SAME_START_MS)),
        lte(schema.trainingSessions.startTime, new Date(Math.max(...times) + SAME_START_MS)),
      ),
    );
}

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Copenhagen" }).format(
    new Date(iso),
  );

/**
 * The status of each session: a duplicate of a stored session or of an
 * earlier one in the same upload, new but hidden as a likely warm-up or
 * cool-down, or simply new.
 */
export async function classify(sessions: ParsedSession[]): Promise<PreviewRow[]> {
  const stored = (await storedAround(sessions)).map((s) => ({ ...s, startTime: s.startTime.toISOString() }));
  const kept: ParsedSession[] = [];

  return sessions.map((session) => {
    const sameId = stored.find((s) => s.source === session.source && s.externalId === session.externalId);
    if (sameId) return { status: "duplicate", reason: "Already imported" };
    const match = stored.find((s) => isSameSession(s, session));
    if (match) {
      return { status: "duplicate", reason: `Same as "${match.title ?? "untitled"}" (${match.source}, ${when(match.startTime)})` };
    }
    const earlier = kept.find((s) => isSameSession(s, session));
    if (earlier) return { status: "duplicate", reason: `Same as "${earlier.title ?? "untitled"}" in this upload` };
    kept.push(session);
    const hidden = autoHideReason(session);
    return hidden ? { status: "auto-hidden", reason: hidden } : { status: "new", reason: null };
  });
}

/** Saves the sessions that are not duplicates. Returns how many were added and hidden. */
export async function importSessions(sessions: ParsedSession[]) {
  const statuses = await classify(sessions);
  const rows = sessions
    .map((session, i) => ({ session, status: statuses[i] }))
    .filter(({ status }) => status.status !== "duplicate")
    .map(({ session, status }) => ({
      ...session,
      startTime: new Date(session.startTime),
      distanceM: session.distanceM,
      visible: status.status === "new",
      autoHiddenReason: status.status === "auto-hidden" ? status.reason : null,
    }));

  const added = rows.length
    ? await db
        .insert(schema.trainingSessions)
        .values(rows)
        .onConflictDoNothing({ target: [schema.trainingSessions.source, schema.trainingSessions.externalId] })
        .returning({ visible: schema.trainingSessions.visible })
    : [];
  return {
    added: added.length,
    hidden: added.filter((r) => !r.visible).length,
    duplicates: sessions.length - added.length,
  };
}
