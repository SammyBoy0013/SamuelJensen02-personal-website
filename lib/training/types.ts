// Shared shapes for the training log (specification 5.6). Used in the browser
// (parsing and the upload preview) and on the server (import and summaries).
//
// A parsed session is summary figures only. No type here has a field for
// coordinates, and the server rejects any session that carries extra fields.

export const sports = ["row", "erg", "strength", "run", "ride", "ski", "swim", "other"] as const;
export type Sport = (typeof sports)[number];

export const sources = ["strava", "strava-file", "concept2", "nk"] as const;
export type Source = (typeof sources)[number];

export type ParsedSession = {
  source: Source;
  /** Stable ID within the source: the Strava activity ID, the Concept2 log ID or the start time. */
  externalId: string;
  /** ISO 8601, UTC. */
  startTime: string;
  sport: Sport;
  title: string | null;
  durationS: number;
  distanceM: number | null;
  avgSplitSPer500: number | null;
  avgRate: number | null;
  avgHr: number | null;
  maxHr: number | null;
  avgWatts: number | null;
};

export type ParseResult = {
  /** What the file was read as, for the preview ("Strava bulk export", …). */
  format: string;
  sessions: ParsedSession[];
  /** Rows that could not be read, in plain words. */
  warnings: string[];
};

/** How an uploaded session compares with what is already stored. */
export type ImportStatus = "new" | "duplicate" | "auto-hidden";

export type PreviewRow = {
  status: ImportStatus;
  /** Why it is a duplicate or hidden, in plain words. */
  reason: string | null;
};
