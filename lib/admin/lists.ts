// The admin's list editors (specification section 6), one per table or part
// of a table. Plain data, so both the server actions and the browser forms use
// it. `paths` are the public routes each save revalidates, in every language.

import type { ListName } from "@/db/tables";

export type FieldType =
  /** One line of text, the same in every language (a club model, a year). */
  | "text"
  /** Text per language: EN, DA and FR tabs. */
  | "localised"
  | "date"
  | "int"
  | "real"
  /** A rowing time to tenths: "6:35.8", or "15.0" for seconds. */
  | "duration"
  /** A race time to hundredths: "7:45.69". */
  | "raceTime"
  | "bool"
  /** Crew names, separated by commas. */
  | "crew";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  /** The page text can mark this field "check" (still to confirm). */
  checkable?: boolean;
};

export type ListDef = {
  slug: string;
  table: ListName;
  label: string;
  group: string;
  /** For tables shared by two pages (glance rows, education). */
  page?: string;
  /** New rows go first (results are newest first) or last. */
  addAt: "start" | "end";
  fields: Field[];
  /** Columns shown in the list. */
  summary: string[];
  paths: string[];
  help?: string;
};

const years: Field = { name: "years", label: "Years", type: "localised", checkable: true };
const yearsText: Field[] = [years, { name: "text", label: "Text", type: "localised", required: true }];

export const lists: ListDef[] = [
  {
    slug: "results",
    table: "races",
    label: "Results",
    group: "Rowing",
    addAt: "start",
    paths: ["/rowing/racing"],
    summary: ["dateLabel", "regatta", "event", "placing"],
    help: "Newest first. The Racing page shows the top ten; \"All results\" shows the rest.",
    fields: [
      { name: "dateLabel", label: "Date as shown", type: "text", checkable: true, help: "Such as \"2026\". Used when there is no exact date." },
      { name: "date", label: "Exact date", type: "date", help: "Optional. Shown instead of the date above." },
      { name: "regatta", label: "Regatta", type: "localised", required: true },
      { name: "place", label: "Place", type: "localised" },
      { name: "event", label: "Event", type: "localised", checkable: true },
      { name: "boatClass", label: "Boat class", type: "text", help: "Such as 1x, 4x or 8+." },
      { name: "crew", label: "Crew", type: "crew", checkable: true, help: "Names separated by commas. Leave empty for a single." },
      { name: "round", label: "Round", type: "localised", help: "Such as \"Semi-final\" or \"B final\"." },
      { name: "placing", label: "Placing", type: "localised", checkable: true },
      { name: "timeMs", label: "Time", type: "raceTime", help: "Such as 7:45.69." },
      { name: "confirmed", label: "Confirmed", type: "bool", help: "Unconfirmed results show a \"check\" tag." },
    ],
  },
  {
    slug: "calendar",
    table: "calendarEvents",
    label: "Calendar",
    group: "Rowing",
    addAt: "end",
    paths: ["/rowing/racing"],
    summary: ["date", "name", "confirmed"],
    help: "Only races marked confirmed appear on the site.",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "name", label: "Race", type: "localised", required: true, checkable: true },
      { name: "place", label: "Place", type: "localised" },
      { name: "confirmed", label: "Confirmed", type: "bool" },
    ],
  },
  {
    slug: "personal-bests",
    table: "personalBests",
    label: "Personal bests",
    group: "Rowing",
    addAt: "end",
    paths: ["/rowing"],
    summary: ["metric", "valueMs", "valueM", "watts", "date"],
    fields: [
      { name: "metric", label: "Distance or test", type: "localised", required: true, help: "Such as \"2,000 m\" or \"1 minute\"." },
      { name: "valueMs", label: "Time", type: "duration", help: "Such as 6:35.8, or 15.0 for seconds. Leave empty for a distance test." },
      { name: "valueM", label: "Distance (metres)", type: "int", help: "For timed tests, such as 375 for the 1 minute." },
      { name: "watts", label: "Watts", type: "int" },
      { name: "date", label: "Date", type: "date", checkable: true },
      { name: "note", label: "Note", type: "localised" },
    ],
  },
  {
    slug: "goals",
    table: "goals",
    label: "Goals",
    group: "Rowing",
    addAt: "end",
    paths: ["/rowing"],
    summary: ["whenLabel", "text"],
    fields: [
      { name: "whenLabel", label: "When", type: "localised", required: true },
      { name: "text", label: "Goal", type: "localised", required: true },
    ],
  },
  {
    slug: "golf-results",
    table: "golfResults",
    label: "Results",
    group: "Golf",
    addAt: "start",
    paths: ["/golf"],
    summary: ["yearLabel", "event", "placing"],
    fields: [
      { name: "yearLabel", label: "Year as shown", type: "text", checkable: true, help: "Such as \"2019\" or \"2018–19\"." },
      { name: "date", label: "Exact date", type: "date" },
      { name: "event", label: "Event", type: "localised", required: true },
      { name: "course", label: "Course", type: "localised" },
      { name: "format", label: "Format", type: "localised" },
      { name: "score", label: "Score", type: "int" },
      { name: "toPar", label: "To par", type: "int", help: "Negative under par, such as -5." },
      { name: "placing", label: "Result", type: "localised" },
    ],
  },
  {
    slug: "golf-rounds",
    table: "golfRounds",
    label: "Rounds",
    group: "Golf",
    addAt: "start",
    paths: ["/golf"],
    summary: ["date", "course", "score", "toPar"],
    help: "The lowest score becomes \"Lowest round\". Strokes gained putting and dispersion are averaged; a statistic with no data is hidden.",
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "course", label: "Course", type: "text", required: true },
      { name: "score", label: "Score", type: "int", required: true },
      { name: "toPar", label: "To par", type: "int" },
      { name: "fairwaysHit", label: "Fairways hit", type: "int" },
      { name: "fairwaysTotal", label: "Fairways in total", type: "int" },
      { name: "gir", label: "Greens in regulation", type: "int" },
      { name: "putts", label: "Putts", type: "int" },
      { name: "sgPutting", label: "Strokes gained putting", type: "real" },
      { name: "dispersionM", label: "Shot dispersion (metres)", type: "real" },
      { name: "notes", label: "Notes (not shown on the site)", type: "text" },
    ],
  },
  {
    slug: "golf-glance",
    table: "glanceRows",
    page: "golf",
    label: "At a glance",
    group: "Golf",
    addAt: "end",
    paths: ["/golf"],
    summary: ["label", "value"],
    help: "{handicap} and {lowestHandicap} are filled in from Settings.",
    fields: [
      { name: "label", label: "Label", type: "localised", required: true },
      { name: "value", label: "Value", type: "localised", required: true, checkable: true },
    ],
  },
  {
    slug: "golf-bag",
    table: "golfBag",
    label: "In the bag",
    group: "Golf",
    addAt: "end",
    paths: ["/golf"],
    summary: ["club", "makeModel"],
    fields: [
      { name: "club", label: "Club", type: "localised", required: true },
      { name: "makeModel", label: "Make and model", type: "text", required: true },
    ],
  },
  {
    slug: "timeline",
    table: "timeline",
    label: "Timeline",
    group: "About",
    addAt: "end",
    paths: ["/about"],
    summary: ["year", "text"],
    help: "Oldest first.",
    fields: [
      { name: "year", label: "Year", type: "text", required: true },
      { name: "text", label: "Milestone", type: "localised", required: true, checkable: true },
    ],
  },
  {
    slug: "about-glance",
    table: "glanceRows",
    page: "about",
    label: "At a glance",
    group: "About",
    addAt: "end",
    paths: ["/about"],
    summary: ["label", "value"],
    help: "{handicap} and {lowestHandicap} are filled in from Settings.",
    fields: [
      { name: "label", label: "Label", type: "localised", required: true },
      { name: "value", label: "Value", type: "localised", required: true, checkable: true },
    ],
  },
  {
    slug: "engineering-education",
    table: "education",
    page: "engineering",
    label: "Education",
    group: "Engineering",
    addAt: "start",
    paths: ["/engineering"],
    summary: ["years", "text"],
    fields: yearsText,
  },
  {
    slug: "skills",
    table: "skills",
    label: "Skills and tools",
    group: "Engineering",
    addAt: "end",
    paths: ["/engineering"],
    summary: ["area", "skills"],
    fields: [
      { name: "area", label: "Area", type: "localised", required: true },
      { name: "skills", label: "Skills", type: "localised", checkable: true, help: "Leave empty to show \"To follow\"." },
    ],
  },
  {
    slug: "cv-education",
    table: "education",
    page: "cv",
    label: "Education",
    group: "CV",
    addAt: "start",
    paths: ["/cv"],
    summary: ["years", "text"],
    fields: yearsText,
  },
  {
    slug: "positions",
    table: "positions",
    label: "Positions of responsibility",
    group: "CV",
    addAt: "start",
    paths: ["/cv"],
    summary: ["years", "text"],
    fields: yearsText,
  },
  {
    slug: "work",
    table: "work",
    label: "Work experience",
    group: "CV",
    addAt: "start",
    paths: ["/cv"],
    summary: ["years", "text"],
    fields: yearsText,
  },
  {
    slug: "languages",
    table: "languages",
    label: "Languages",
    group: "CV",
    addAt: "end",
    paths: ["/cv"],
    summary: ["names", "level"],
    help: "Shown as \"English, Danish and French (native); …\".",
    fields: [
      { name: "names", label: "Languages", type: "localised", required: true },
      { name: "level", label: "Level", type: "localised", required: true },
    ],
  },
];

export function getList(slug: string): ListDef | undefined {
  return lists.find((l) => l.slug === slug);
}
