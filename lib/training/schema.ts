// The shape of one session as the browser sends it, shared by the upload form
// (to skip a bad row before sending) and the server (which checks again).

import { z } from "zod";
import { sources, sports } from "./types";

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
