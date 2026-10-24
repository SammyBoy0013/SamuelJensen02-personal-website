// CV, from docs/04-page-text-en.md "CV". The phone number and address are
// never part of the web CV (specification section 4).

import type { Checked } from "./types";

export const profile =
  "Engineering student and competitive rower, studying for an MSc in Product Development and Innovation at SDU. Trilingual in English, Danish and French, and used to training at a high level alongside full-time study. Helpful, curious and energetic, with leadership experience from boarding school and student associations.";

export const education: { years: Checked; text: string }[] = [
  { years: { value: "2025–2028 (expected)" }, text: "MSc in Engineering, Product Development and Innovation, SDU" },
  { years: { value: "2022–2025", check: true }, text: "BSc in Engineering, Product Development and Innovation, SDU" },
  {
    years: { value: "2021–2022" },
    text: "Supplementary courses for Danish university entry, including Physics B (GSK)",
  },
  {
    years: { value: "2018–2021" },
    text: "A levels in Maths and Chemistry, Culford School, Suffolk; sports scholar",
  },
  {
    years: { value: "2008–2018" },
    text: "International School Le Verseau, Bierges, Belgium (taught in French and English)",
  },
];

export const positions: { years: Checked; text: string }[] = [
  { years: { value: null, check: true }, text: "Vice-chair, SIF (engineering student association, SDU)" },
  { years: { value: null, check: true }, text: "Chair, SIF Event (18 months)" },
  { years: { value: "2020–2021" }, text: "Head of Edwards House and prefect, Culford School" },
];

export const work: { years: Checked; text: string }[] = [
  { years: { value: "2022", check: true }, text: "Temporary worker, plant nursery: packing flowers (three months)" },
  { years: { value: "Occasional" }, text: "Coaching junior rowers, Odense Roklub" },
];

export const sport = [
  "Rowing: competition squad, Odense Roklub; 12th in the single at the European Universities Championships 2026",
  "Golf: handicap +1.0 (lowest +2.3); former elite group, Odense Eventyr Golf; Culford school team",
];

export const skills = "Autodesk Fusion, Python, 3D printing, laser cutting, basic electronics.";

export const languages = "English, Danish and French (native); German, Swedish and Norwegian (basic).";

export const interests = "cooking, history, reading the classics, *The Lord of the Rings* and *Star Wars*.";
