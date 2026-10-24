// Golf, from docs/04-page-text-en.md "Golf".

import type { Checked } from "./types";
import { settings } from "./site";

export const introduction = [
  "Golf was my first sport. My father put a club in my hands before I was four, and by six I was playing properly. At Culford I trained 18 to 20 hours a week in the school's elite golf programme and competed for the school across the UK. All told, I've spent more than 12,000 hours on the range and the course.",
  "Rowing now takes priority, so I play in off weeks and at weekends when I can. Golf gives me what rowing doesn't: familiarity, peace and quiet, and satisfaction. One day I may come back to it properly. If my game is where I left it, or better, turning professional is a shot I'd like to take.",
];

export const atAGlance: [string, string][] = [
  ["Handicap", `${settings.handicap} (lowest ${settings.lowestHandicap})`],
  ["Lowest round", "67 (−5), Odense Eventyr Golf, Syd-Vest course, 17 August 2022"],
  ["Home club", "The Great Northern"],
  ["Previous clubs", "Royal Waterloo, Flempton, Royal Worlington, Odense Eventyr, Odense Golfklub"],
  ["Strength", "Short game"],
  ["Working on", "Putting"],
  ["Golfers I admire", "Collin Morikawa and Ludvig Åberg"],
];

export const results: { year: Checked; event: string; result: string }[] = [
  { year: { value: "2019", check: true }, event: "Junior club championship, Royal Waterloo", result: "Winner" },
  { year: { value: "2018–19" }, event: "ISGA, area final (Culford B)", result: "Runner-up to Culford A" },
  { year: { value: "2018–19" }, event: "SSGT, area final (Culford)", result: "Runner-up" },
  { year: { value: "2019–21" }, event: "ISGA and SSGT", result: "Cancelled due to Covid-19" },
];

export const bag: [string, string][] = [
  ["Driver", "Titleist"],
  ["3-wood", "TaylorMade"],
  ["3-iron", "Mizuno MP-20 HMB"],
  ["4–5-irons", "Mizuno MP-20 MMC"],
  ["6-iron to PW", "Mizuno MP-20"],
  ["Wedges (50°, 54°, 58°)", "Mizuno T24"],
  ["Putter", "TaylorMade"],
];

export const holesInOne =
  "The first came at 14, on the 15th at Marache. The second, in the video, came on the 15th at Silkeborg Golf Club during DIAC. It was 156 yards, playing 149 downhill but into a left-to-right wind. I hit a trapped fade with a 9-iron to ride the wind. It started a little left and tracked the whole way.";

export const statisticsIntro =
  "Strokes gained putting and shot dispersion are what I watch most. Dispersion tells me how to plan my way around the next course.";

/**
 * Summary statistics (specification 5.7). `null` means no data yet: the tile
 * is hidden. Round statistics arrive with the golf rounds in phase 3.
 */
export const statistics: {
  key: "handicap" | "lowestHandicap" | "lowestRound" | "sgPutting" | "dispersion";
  value: number | null;
  decimals?: number;
  prefix?: string;
}[] = [
  { key: "handicap", value: 1.0, decimals: 1, prefix: "+" },
  { key: "lowestHandicap", value: 2.3, decimals: 1, prefix: "+" },
  { key: "lowestRound", value: 67 },
  { key: "sgPutting", value: null },
  { key: "dispersion", value: null },
];
