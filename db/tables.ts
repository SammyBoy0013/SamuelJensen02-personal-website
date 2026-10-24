import * as schema from "./schema";

/** The ordered list tables, by name. Shared by the seed, the public pages and the admin. */
export const listTables = {
  races: schema.races,
  calendarEvents: schema.calendarEvents,
  personalBests: schema.personalBests,
  goals: schema.goals,
  golfResults: schema.golfResults,
  golfRounds: schema.golfRounds,
  golfBag: schema.golfBag,
  glanceRows: schema.glanceRows,
  timeline: schema.timeline,
  education: schema.education,
  positions: schema.positions,
  work: schema.work,
  skills: schema.skills,
  languages: schema.languages,
};

export type ListName = keyof typeof listTables;
export type ListRow<N extends ListName> = (typeof listTables)[N]["$inferSelect"];
