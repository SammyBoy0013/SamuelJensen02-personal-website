// The site map from docs/01-specification.md section 2. Labels live in
// messages/*.json under `pages.<key>`; this file holds routes and anchors.

export type Section = {
  /** Message key under `pages.<page>.sections`, also the anchor id. */
  id: string;
  /** Set for sub-pages listed in a dropdown; otherwise the link is `#id`. */
  href?: string;
};

export type Page = {
  key: string;
  href: string;
  sections: Section[];
};

/** Main navigation, in the order of the specification. */
export const mainPages: Page[] = [
  {
    key: "home",
    href: "/",
    // The hero is the top of the page, so it is not listed as a section.
    sections: [
      { id: "rowing" },
      { id: "golf" },
      { id: "about" },
      { id: "engineering" },
      { id: "contact" },
    ],
  },
  {
    key: "rowing",
    href: "/rowing",
    sections: [
      { id: "introduction" },
      { id: "goals" },
      { id: "personal-bests" },
      { id: "training-log" },
      { id: "racing", href: "/rowing/racing" },
      { id: "dashboard", href: "/rowing/dashboard" },
    ],
  },
  {
    key: "golf",
    href: "/golf",
    sections: [
      { id: "introduction" },
      { id: "at-a-glance" },
      { id: "results" },
      { id: "statistics" },
      { id: "in-the-bag" },
      { id: "holes-in-one" },
      { id: "dashboard", href: "/golf/dashboard" },
    ],
  },
  {
    key: "about",
    href: "/about",
    sections: [
      { id: "introduction" },
      { id: "my-story" },
      { id: "timeline" },
      { id: "what-i-stand-for" },
      { id: "away-from-sport" },
      { id: "training-philosophy", href: "/about/training-philosophy" },
    ],
  },
  {
    key: "engineering",
    href: "/engineering",
    // "Reports and publications" is hidden behind a feature flag (phase 3).
    sections: [
      { id: "introduction" },
      { id: "education" },
      { id: "bachelor-project" },
      { id: "skills" },
      { id: "future-work" },
    ],
  },
  {
    key: "gallery",
    href: "/gallery",
    sections: [{ id: "rowing" }, { id: "golf" }, { id: "life" }],
  },
  {
    key: "cv",
    href: "/cv",
    sections: [
      { id: "profile" },
      { id: "education" },
      { id: "positions" },
      { id: "work" },
      { id: "sport" },
      { id: "skills" },
    ],
  },
  {
    key: "contact",
    href: "/contact",
    sections: [{ id: "email" }, { id: "collaborate" }, { id: "copy-address" }],
  },
];

/** Pages reached from a parent page or the footer rather than the main bar. */
export const subPages: Page[] = [
  {
    key: "racing",
    href: "/rowing/racing",
    sections: [{ id: "results" }, { id: "race-stories" }, { id: "calendar" }],
  },
  { key: "rowingDashboard", href: "/rowing/dashboard", sections: [] },
  { key: "golfDashboard", href: "/golf/dashboard", sections: [] },
  { key: "trainingPhilosophy", href: "/about/training-philosophy", sections: [] },
  { key: "privacy", href: "/privacy", sections: [] },
];

export const socialLinks = [
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/samuel-gustav-jensen-824288295/" },
  { key: "strava", label: "Strava", href: "https://www.strava.com/athletes/51417053" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/samuel_jensen02/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/smmyboy.jensen" },
] as const;

export function getPage(key: string): Page {
  const page = [...mainPages, ...subPages].find((p) => p.key === key);
  if (!page) throw new Error(`Unknown page: ${key}`);
  return page;
}
