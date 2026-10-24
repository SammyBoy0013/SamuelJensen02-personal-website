// The phase 2 content (content/*.ts, from docs/04-page-text-en.md) as database
// rows. Used by the seed script, and by the public pages when no database is
// configured, so a build without DATABASE_URL still shows the approved text.
//
// The phone number and date of birth are deliberately empty: Samuel adds them
// in admin, so neither is ever in the repository (specification section 4).

import * as about from "@/content/about";
import * as cv from "@/content/cv";
import * as engineering from "@/content/engineering";
import * as golf from "@/content/golf";
import * as rowing from "@/content/rowing";
import { settings as siteSettings } from "@/content/site";
import type { Checked } from "@/content/types";
import { pageBlocks } from "@/lib/blocks";
import { socialLinks } from "@/lib/site";
import type { Localised } from "./schema";

const en = (value: string): Localised => ({ en: value });
const enOrNull = (value: string | null): Localised | null => (value === null ? null : en(value));
/** Field names whose Checked value is flagged "check". */
const checks = (fields: Record<string, Checked>) =>
  Object.entries(fields)
    .filter(([, fact]) => fact.check)
    .map(([name]) => name);
const ordered = <T extends object>(rows: T[]) => rows.map((row, i) => ({ id: i + 1, sortOrder: i, ...row }));

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "18 May 2025" to "2025-05-18". */
function isoDate(text: string): string {
  const [day, month, year] = text.split(" ");
  const m = MONTHS.indexOf(month) + 1;
  if (!m) throw new Error(`Unreadable date: ${text}`);
  return `${year}-${String(m).padStart(2, "0")}-${day.padStart(2, "0")}`;
}
/** "6:35.8", "3:06.7" or "15.0 s" to milliseconds. */
function durationMs(text: string): number {
  const clean = text.replace(/\s*s$/, "");
  const parts = clean.split(":").map(Number);
  const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  return Math.round(seconds * 1000);
}

export type SettingsValues = {
  email: string;
  phone: string;
  dateOfBirth: string;
  handicap: string;
  lowestHandicap: string;
  heightCm: number | null;
  wingspanCm: number | null;
  social: Record<(typeof socialLinks)[number]["key"], string>;
  features: { sponsors: boolean; reportsAndPublications: boolean };
};

export const seedSettings: SettingsValues = {
  email: siteSettings.email,
  phone: "",
  dateOfBirth: "",
  handicap: siteSettings.handicap,
  lowestHandicap: siteSettings.lowestHandicap,
  heightCm: rowing.vitalStatistics.height.value,
  wingspanCm: rowing.vitalStatistics.wingspan.value,
  social: Object.fromEntries(socialLinks.map((s) => [s.key, s.href])) as SettingsValues["social"],
  features: { ...siteSettings.features },
};

export const seedBlocks = pageBlocks.flatMap((p) =>
  p.blocks.map((b) => ({ page: p.page, key: b.key, locale: "en", body: b.seed })),
);

export const seedRows = {
  races: ordered(
    rowing.results.map((r) => ({
      date: null,
      dateLabel: r.date.value,
      regatta: en(r.regatta),
      place: null,
      event: enOrNull(r.event.value),
      boatClass: null,
      crew: r.crew.value && r.crew.value !== "—" ? r.crew.value.split(", ") : [],
      round: null,
      placing: enOrNull(r.result.value),
      timeMs: null,
      storyKey: null,
      confirmed: true,
      checkFields: checks({ dateLabel: r.date, event: r.event, crew: r.crew, placing: r.result }),
    })),
  ),
  calendarEvents: ordered(
    rowing.calendar.map((c) => ({
      date: isoDate(c.date),
      name: en(c.event.value ?? ""),
      place: en(c.place),
      confirmed: c.confirmed,
      checkFields: checks({ name: c.event }),
    })),
  ),
  personalBests: ordered(
    rowing.personalBests.map((pb) => {
      const metres = /^(\d+) m$/.exec(pb.time);
      return {
        metric: en(pb.distance),
        valueMs: metres ? null : durationMs(pb.time),
        valueM: metres ? Number(metres[1]) : null,
        watts: pb.watts ? Number.parseInt(pb.watts, 10) : null,
        date: pb.date.value ? isoDate(pb.date.value) : null,
        note: null,
        checkFields: checks({ date: pb.date }),
      };
    }),
  ),
  goals: ordered(rowing.goals.map((g) => ({ whenLabel: en(g.when), text: en(g.goal) }))),
  golfResults: ordered(
    golf.results.map((r) => ({
      date: null,
      yearLabel: r.year.value,
      event: en(r.event),
      course: null,
      format: null,
      score: null,
      toPar: null,
      placing: en(r.result),
      checkFields: checks({ yearLabel: r.year }),
    })),
  ),
  // The lowest round from "At a glance", so the statistic comes from the rounds table.
  golfRounds: ordered([
    {
      date: "2022-08-17",
      course: "Odense Eventyr Golf, Syd-Vest course",
      score: 67,
      toPar: -5,
      fairwaysHit: null,
      fairwaysTotal: null,
      gir: null,
      putts: null,
      sgPutting: null,
      dispersionM: null,
      notes: null,
    },
  ]),
  golfBag: ordered(golf.bag.map(([club, makeModel]) => ({ club: en(club), makeModel }))),
  glanceRows: [
    // {handicap} and {lowestHandicap} are filled in from Settings.
    ...golf.atAGlance.map(([label, value]) => ({
      page: "golf",
      label: en(label),
      value: en(label === "Handicap" ? "{handicap} (lowest {lowestHandicap})" : value),
      checkFields: [] as string[],
    })),
    ...about.atAGlance.map(([label, value]) => ({
      page: "about",
      label: en(label),
      value: en(label === "Golf" ? "Handicap {handicap}" : value),
      checkFields: [] as string[],
    })),
  ].map((row, i, all) => ({ id: i + 1, sortOrder: all.slice(0, i).filter((r) => r.page === row.page).length, ...row })),
  timeline: ordered(
    about.timeline.map((t) => ({ year: t.year, text: en(t.text.value ?? ""), checkFields: checks({ text: t.text }) })),
  ),
  education: [
    ...engineering.education.map((e) => ({
      page: "engineering",
      years: enOrNull(e.years.value),
      text: en(e.qualification),
      checkFields: checks({ years: e.years }),
    })),
    ...cv.education.map((e) => ({
      page: "cv",
      years: enOrNull(e.years.value),
      text: en(e.text),
      checkFields: checks({ years: e.years }),
    })),
  ].map((row, i, all) => ({ id: i + 1, sortOrder: all.slice(0, i).filter((r) => r.page === row.page).length, ...row })),
  positions: ordered(
    cv.positions.map((p) => ({ years: enOrNull(p.years.value), text: en(p.text), checkFields: checks({ years: p.years }) })),
  ),
  work: ordered(
    cv.work.map((w) => ({ years: enOrNull(w.years.value), text: en(w.text), checkFields: checks({ years: w.years }) })),
  ),
  skills: ordered(
    engineering.skills.map((s) => ({
      area: en(s.area),
      skills: enOrNull(s.skills.value),
      checkFields: checks({ skills: s.skills }),
    })),
  ),
  // "English, Danish and French (native); German, Swedish and Norwegian (basic)."
  languages: ordered(
    cv.languages
      .replace(/\.$/, "")
      .split("; ")
      .map((part) => {
        const [, names, level] = /^(.*) \((.*)\)$/.exec(part)!;
        return { names: en(names), level: en(level) };
      }),
  ),
};
