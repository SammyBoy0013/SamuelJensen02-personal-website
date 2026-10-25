// Database schema (docs/03-technical-setup.md "Database schema").
//
// Text that a visitor reads is stored per language as { en, da?, fr? } so the
// phase 6 translations fit without new columns. Danish and French fall back to
// English. `check_fields` lists the fields the page text marks "check" (still
// to confirm); the site shows a small tag beside them until Samuel clears it.
//
// Privacy: no table has a coordinate column, and the phone number and date of
// birth live only in `settings` (specification section 4).

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  index,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type Localised = { en: string; da?: string; fr?: string };

const localised = (name: string) => jsonb(name).$type<Localised>();
const sortOrder = () => integer("sort_order").notNull().default(0);
const checkFields = () =>
  text("check_fields")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`);
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: serial("id").primaryKey(),
    page: text("page").notNull(),
    key: text("key").notNull(),
    locale: text("locale").notNull(),
    body: text("body").notNull().default(""),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("content_blocks_page_key_locale").on(t.page, t.key, t.locale)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});

export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  /** Exact date when known. */
  date: date("date"),
  /** What the table shows when there is no exact date, such as "2026". */
  dateLabel: text("date_label"),
  regatta: localised("regatta").notNull(),
  place: localised("place"),
  event: localised("event"),
  boatClass: text("boat_class"),
  crew: text("crew")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  round: localised("round"),
  placing: localised("placing"),
  timeMs: integer("time_ms"),
  storyKey: text("story_key"),
  confirmed: boolean("confirmed").notNull().default(true),
  checkFields: checkFields(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  date: date("date").notNull(),
  name: localised("name").notNull(),
  place: localised("place"),
  confirmed: boolean("confirmed").notNull().default(false),
  checkFields: checkFields(),
});

export const personalBests = pgTable("personal_bests", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  /** The distance or test as shown, such as "2,000 m" or "1 minute". */
  metric: localised("metric").notNull(),
  valueMs: integer("value_ms"),
  valueM: integer("value_m"),
  watts: integer("watts"),
  date: date("date"),
  note: localised("note"),
  checkFields: checkFields(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  whenLabel: localised("when_label").notNull(),
  text: localised("text").notNull(),
});

// Filled by the training importers (lib/training). Summary figures only:
// there is no column for coordinates, and the parsers drop them on reading.
export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    externalId: text("external_id").notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    sport: text("sport").notNull(),
    title: text("title"),
    durationS: integer("duration_s").notNull(),
    distanceM: integer("distance_m"),
    avgSplitSPer500: real("avg_split_s_per_500"),
    avgRate: real("avg_rate"),
    avgHr: integer("avg_hr"),
    maxHr: integer("max_hr"),
    avgWatts: integer("avg_watts"),
    visible: boolean("visible").notNull().default(true),
    autoHiddenReason: text("auto_hidden_reason"),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("training_sessions_source_external_id").on(t.source, t.externalId),
    // Summaries, the session list and the duplicate check all search by start time.
    index("training_sessions_start_time").on(t.startTime),
  ],
);

export const golfResults = pgTable("golf_results", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  date: date("date"),
  /** What the table shows when there is no exact date, such as "2018–19". */
  yearLabel: text("year_label"),
  event: localised("event").notNull(),
  course: localised("course"),
  format: localised("format"),
  score: integer("score"),
  toPar: integer("to_par"),
  placing: localised("placing"),
  checkFields: checkFields(),
});

export const golfRounds = pgTable("golf_rounds", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  date: date("date"),
  course: text("course").notNull(),
  score: integer("score").notNull(),
  toPar: integer("to_par"),
  fairwaysHit: integer("fairways_hit"),
  fairwaysTotal: integer("fairways_total"),
  gir: integer("gir"),
  putts: integer("putts"),
  sgPutting: real("sg_putting"),
  /** Average shot dispersion in metres, one of the two priority statistics. */
  dispersionM: real("dispersion_m"),
  notes: text("notes"),
});

export const golfBag = pgTable("golf_bag", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  club: localised("club").notNull(),
  makeModel: text("make_model").notNull(),
});

/** "At a glance" rows on About and Golf. */
export const glanceRows = pgTable("glance_rows", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  sortOrder: sortOrder(),
  label: localised("label").notNull(),
  value: localised("value").notNull(),
  checkFields: checkFields(),
});

export const timeline = pgTable("timeline", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  year: text("year").notNull(),
  text: localised("text").notNull(),
  checkFields: checkFields(),
});

/** Education rows. `page` is "engineering" or "cv": the two pages word them differently. */
export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  sortOrder: sortOrder(),
  years: localised("years"),
  text: localised("text").notNull(),
  checkFields: checkFields(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  years: localised("years"),
  text: localised("text").notNull(),
  checkFields: checkFields(),
});

export const work = pgTable("work", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  years: localised("years"),
  text: localised("text").notNull(),
  checkFields: checkFields(),
});

/** The Engineering skills table. The CV's one-line skills summary is a text block. */
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  area: localised("area").notNull(),
  skills: localised("skills"),
  checkFields: checkFields(),
});

/** The CV's languages, one row per level ("native", "basic"). */
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  sortOrder: sortOrder(),
  names: localised("names").notNull(),
  level: localised("level").notNull(),
});

const photoColumns = () => ({
  id: serial("id").primaryKey(),
  blobUrl: text("blob_url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  dominantColour: text("dominant_colour").notNull(),
  altEn: text("alt_en").notNull(),
  altDa: text("alt_da"),
  altFr: text("alt_fr"),
  credit: text("credit"),
  sortOrder: sortOrder(),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  ...photoColumns(),
  category: text("category").notNull(),
});

/** Approved bachelor project photos (NDA): shown only once `approved` is set. */
export const projectPhotos = pgTable("project_photos", {
  ...photoColumns(),
  category: text("category").notNull().default("project"),
  approved: boolean("approved").notNull().default(false),
});
