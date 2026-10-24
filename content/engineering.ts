// Engineering, from docs/04-page-text-en.md "Engineering".

import type { Checked } from "./types";

export const introduction = [
  "I chose engineering because I enjoy solving problems. Product development and innovation lets me take a problem from the first sketch to a working prototype. That's the same loop I live in sport: find what's slowing you down, fix it, and go faster.",
];

export const education: { years: Checked; qualification: string }[] = [
  {
    years: { value: "2025–2028 (expected)" },
    qualification:
      "MSc in Engineering, Product Development and Innovation, University of Southern Denmark (SDU)",
  },
  {
    years: { value: "2022–2025", check: true },
    qualification: "BSc in Engineering, Product Development and Innovation, SDU",
  },
  { years: { value: "2018–2021" }, qualification: "A levels in Maths and Chemistry, Culford School, Suffolk" },
];

export const educationNote = "I study as part of Syddansk Elite, SDU's arrangement for elite athletes.";

export const bachelorProject = {
  title: "AAVEQ",
  paragraphs: [
    "AAVEQ is developing a self-guiding motor boat. During development its electronics change constantly, and they had no safe place to keep them. My project designed a protective enclosure that keeps the electronics safe yet lets the team remove and swap components quickly.",
    "The project is under a non-disclosure agreement, so only approved photos appear here.",
  ],
};

export const skills: { area: string; skills: Checked }[] = [
  { area: "CAD", skills: { value: "Autodesk Fusion", check: true } },
  { area: "Programming", skills: { value: "Python" } },
  { area: "Prototyping", skills: { value: "3D printing, laser cutting, basic electronics" } },
  { area: "Methods", skills: { value: null } },
  {
    area: "Leadership",
    skills: {
      value:
        "Vice-chair of SIF (SDU's engineering student association); chair of SIF Event for 18 months; Head of House at Culford",
    },
  },
];

export const futureWork = [
  {
    lead: "Rowing shells:",
    text: "how power curves and oar design affect the way a boat moves up and down through the stroke, and how that changes its run through the water.",
  },
  { lead: "Golf:", text: "launch monitors, simulators and club construction." },
  {
    lead: "Cricket:",
    text: "there's no cricket launch monitor on the market yet. I'd like to explore one for my master's thesis.",
  },
];
