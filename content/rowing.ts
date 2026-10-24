// Rowing and Racing, from docs/04-page-text-en.md "Rowing" and "Racing".

import type { Checked } from "./types";

export const introduction = [
  "I came to rowing late. I started at Odense Roklub in September 2024, simply to stay fit for golf through the winter. Within a year I'd moved from the university eight to the competition squad, and I now race the single.",
  "Sweep rowing is my first love. It's the ultimate team sport: you depend completely on the people in the boat to make it move. Sculling the single has taught me the other side: technique, patience and a lot of time alone with my own thoughts.",
  "What keeps me hooked is the pursuit of perfection, and finding the mental limit before the physical one. A perfect row feels like flying: perfect rhythm and effortless power.",
];

export const goals = [
  { when: "January 2027", goal: "Sub-6:20 for 2,000 m at the Danish ergometer championships" },
  { when: "March 2027", goal: "Sub-6:15 for 2,000 m" },
  {
    when: "2027 season",
    goal: "A place at a national talent centre (TCØ or TCV); more competitive at the European Universities Championships",
  },
  { when: "By 2030", goal: "The Danish national team, and on the road to Olympic qualification" },
];

/** Ergometer personal bests. `watts` is optional (specification 5.5). */
export const personalBests: { distance: string; time: string; watts?: string; date: Checked }[] = [
  { distance: "100 m", time: "15.0 s", watts: "830 W", date: { value: null, check: true } },
  { distance: "1 minute", time: "375 m", watts: "684 W", date: { value: null, check: true } },
  { distance: "1,000 m", time: "3:06.7", date: { value: null, check: true } },
  { distance: "2,000 m", time: "6:35.8", date: { value: "18 May 2025" } },
  { distance: "6,000 m", time: "21:38.7", date: { value: null, check: true } },
];

export const personalBestsNote = "The PB table updates after the test week at the end of November.";

export const onTheWater = {
  time: "7:45.69",
  text: "for 2,000 m in the single, European Universities Championships semi-final, Zagreb 2026.",
};

export const vitalStatistics = {
  height: { value: 195, unit: "cm" },
  wingspan: { value: 197, unit: "cm" },
  weight: "Open weight",
};

export const trainingLogIntro =
  "Every session I row, erg and lift, from my training log. Warm-ups and cool-downs are filtered out; the work is all here.";

// ---- Racing ----

export const racingIntro =
  'Every race I\'ve rowed, best and worst. The latest ten are shown here; the full list sits behind "All results".';

/** Newest first. Phase 3 splits these into the `races` columns. */
export const results: {
  date: Checked;
  regatta: string;
  event: Checked;
  crew: Checked;
  result: Checked;
}[] = [
  {
    date: { value: "2026" },
    regatta: "European Universities Championships, Zagreb",
    event: { value: "Men's single (1x)" },
    crew: { value: "—" },
    result: { value: "12th overall (6th, B final)" },
  },
  {
    date: { value: "2026" },
    regatta: "European Universities Championships, Zagreb",
    event: { value: "Men's quad (4x)" },
    crew: { value: null, check: true },
    result: { value: "Out in qualifying" },
  },
  {
    date: { value: "2026" },
    regatta: "Odense Long Distance",
    event: { value: "University mixed eight (8+)" },
    crew: { value: null, check: true },
    result: { value: "2nd of 2" },
  },
  {
    date: { value: "2026" },
    regatta: "Danish indoor championships",
    event: { value: "Men's university 1,000 m" },
    crew: { value: "—" },
    result: { value: "3rd (bronze)" },
  },
  {
    date: { value: "2025" },
    regatta: "Danish championships",
    event: { value: "University eight (8+)" },
    crew: { value: null, check: true },
    result: { value: "1st", check: true },
  },
  {
    date: { value: "2025" },
    regatta: "Odense Long Distance",
    event: { value: "University mixed eight (8+)" },
    crew: { value: null, check: true },
    result: { value: "2nd of 2" },
  },
  {
    date: { value: null, check: true },
    regatta: "Bagsværd Regatta",
    event: { value: null, check: true },
    crew: { value: null, check: true },
    result: { value: "B final" },
  },
];

export const resultsStillToAdd = "Still to add: Sorø Regatta, Årgangsmesterskaberne and the Copenhagen Harbour Race.";

export const raceStories = [
  {
    title: "Proudest: the semi-final in Zagreb.",
    text: "The fastest and best I've ever rowed: 7:45.69, after only four months in the single.",
  },
  {
    title: "Hardest lesson: the B final in Zagreb.",
    text: "I hit five buoys in my first ten strokes, fell behind and spent the race in everyone's wash. Rather than let the anger sit with me for the rest of the day, I went and did an erg session to get it out of my body. I learnt to start a single properly.",
  },
];

/** Only races marked confirmed are shown (specification 5.5). */
export const calendar: { date: string; event: Checked; place: string; confirmed: boolean }[] = [
  {
    date: "31 October 2026",
    event: { value: "Haraldsted Sø regatta", check: true },
    place: "Haraldsted Sø",
    confirmed: true,
  },
  {
    date: "9 January 2027",
    event: { value: "Danish ergometer championships (DM)" },
    place: "Venue to be announced",
    confirmed: true,
  },
];
