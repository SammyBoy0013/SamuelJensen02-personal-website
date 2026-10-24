// About, from docs/04-page-text-en.md "About".

import type { Checked } from "./types";

export const headline = "Viriliter agite, estote fortes.";

export const introduction = [
  "I'm Samuel Jensen: an engineer, a rower and a golfer. I was born in Belgium, grew up between French and English, and finished school as a boarder in England. Today I live in Odense, where I'm studying for an MSc in Product Development and Innovation at the University of Southern Denmark and racing the single for Odense Roklub.",
  "Whatever I'm doing, I'm solving a problem: finding what's wrong, fixing it, and making things work better and faster.",
];

export const story = [
  "**Belgium.** I was born and raised in Rixensart. I went to Le Verseau, an international school in Bierges, where I was taught in French and English. My father introduced me to golf before I was four, and by six I was playing properly. I also swam for years, but at 14 I stopped to focus on golf.",
  "**Culford.** At 16 I moved to Culford School in Suffolk as a boarder and sports scholar. I took A levels in Maths and Chemistry and trained in the school's elite golf programme, competing for the school team across the UK. In my final year I was Head of Edwards House. Those three years made me grow as a person. Boarding taught me to be independent, to make the most of what's around me, and that family is also the people you spend your time with.",
  "**Odense.** In 2021 I moved to Denmark. I chose Odense for its Product Development and Innovation programme and its golf clubs. It's big enough to have everything I need, yet small enough never to feel lost. After a year retaking courses that Danish universities required, I completed my BSc in Engineering at SDU. I then continued straight into the MSc.",
  "**Rowing.** I'd watched the Boat Race as a child and always thought rowing looked cool. In September 2024 I joined Odense Roklub, mainly to stay fit for golf through the winter. I soon became decently good at it, and the club's social side made me stay. A year later I moved from the university team to the competition squad. In 2026 I raced the single at the European Universities Championships in Zagreb.",
];

/** Oldest first; the newest milestone sits at the bottom. */
export const timeline: { year: string; text: Checked }[] = [
  { year: "2002", text: { value: "Born in Rixensart, Belgium" } },
  { year: "c. 2006", text: { value: "First golf lessons, introduced by my father" } },
  { year: "2008–2018", text: { value: "International School Le Verseau, Bierges" } },
  { year: "2018", text: { value: "Moved to Culford School, Suffolk, as a sports scholar" } },
  { year: "2019", text: { value: "Junior club champion, Royal Waterloo Golf Club", check: true } },
  { year: "2020–2021", text: { value: "Head of Edwards House, Culford" } },
  { year: "2021", text: { value: "A levels in Maths and Chemistry; moved to Odense" } },
  { year: "2021–2022", text: { value: "Retook courses for Danish university entry, including Physics B" } },
  { year: "2022", text: { value: "Lowest round: 67 (−5), Odense Eventyr Golf, Syd-Vest course" } },
  {
    year: "2022–2025",
    text: { value: "BSc in Engineering, Product Development and Innovation, SDU", check: true },
  },
  { year: "2024", text: { value: "Started rowing at Odense Roklub, university squad" } },
  {
    year: "2025",
    text: { value: "Danish champion, university 8+; joined the competition squad; started the MSc at SDU" },
  },
  {
    year: "2026",
    text: {
      value:
        "12th in the single, European Universities Championships, Zagreb; bronze, university 1,000 m, Danish indoor championships",
    },
  },
];

export const standFor = {
  motto: "Viriliter agite, estote fortes",
  paragraphs: [
    'Culford\'s motto translates roughly as "act manfully, be strong". I read it as *be gentlemanly and strong*. They\'re the values I try to live up to every day, whether in a boat, on a course or in a project team.',
    "My golf coach at Culford, Lawrence Dodd, showed me that training is as much mental as physical. With Dr James Earle, my strength and conditioning coach, he taught me that sport must be taken seriously but must stay fun. The way you behave reflects who you are.",
    "One line from my childhood golf coaching has stayed with me: *there is powerless effort, and there is effortless power.* I'm always chasing the second.",
  ],
};

export const awayFromSport = [
  "People are usually surprised by how nerdy I am. I know far too much about *The Lord of the Rings* and *Star Wars*, and a little about *Warhammer 40,000* and *Harry Potter*. I love history, especially the what-ifs: how things might have turned out had circumstances been different. I'm working my way through the classics, and I'm learning to cook properly, the kind of cooking that makes friends excited to come round for dinner.",
  "At SDU I was vice-chair of SIF, the student association for engineers, and chaired SIF Event for a year and a half.",
];

export const atAGlance: [string, string][] = [
  ["Born", "2002, Rixensart, Belgium"],
  ["Nationality", "Danish and Belgian"],
  ["Languages", "English, Danish and French (native); German, Swedish and Norwegian (basic)"],
  ["Lived in", "Belgium (16 years), England (3 years), Denmark (5 years)"],
  ["Studying", "MSc in Product Development and Innovation, SDU (to 2028)"],
  ["Rowing", "Odense Roklub, single sculls; open weight"],
  ["Golf", "Handicap +1.0"],
  ["Height", "195 cm"],
  ["Friends would say", "Helpful, curious, energetic"],
];
