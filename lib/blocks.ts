// Every editable text block on the site, page by page. The admin "Pages"
// section lists these; the seed fills them in English from content/ (the
// approved text in docs/04-page-text-en.md). Bodies are Markdown: paragraphs
// separated by a blank line, "- " for list items, **bold** and *italic*.

import * as about from "@/content/about";
import * as contact from "@/content/contact";
import * as cv from "@/content/cv";
import * as engineering from "@/content/engineering";
import * as golf from "@/content/golf";
import * as home from "@/content/home";
import * as rowing from "@/content/rowing";

export type BlockDef = {
  key: string;
  label: string;
  /** "line" is a single line of plain text (titles, taglines). */
  kind: "line" | "markdown";
  seed: string;
  help?: string;
};

export type PageBlocks = { page: string; label: string; paths: string[]; blocks: BlockDef[] };

const paragraphs = (items: string[]) => items.join("\n\n");
const leadItems = (items: { lead: string; text: string }[]) =>
  items.map((i) => `- **${i.lead}** ${i.text}`).join("\n");

export const pageBlocks: PageBlocks[] = [
  {
    page: "home",
    label: "Home",
    paths: ["/"],
    blocks: [
      { key: "hero-title", label: "Hero: name", kind: "line", seed: home.hero.title },
      { key: "hero-tagline", label: "Hero: tagline", kind: "line", seed: home.hero.tagline },
      { key: "rowing-tagline", label: "Rowing slide", kind: "line", seed: home.slides.rowing.tagline },
      { key: "golf-tagline", label: "Golf slide", kind: "line", seed: home.slides.golf.tagline },
      { key: "about-tagline", label: "About slide", kind: "line", seed: home.slides.about.tagline },
      {
        key: "engineering-tagline",
        label: "Engineering slide",
        kind: "line",
        seed: home.slides.engineering.tagline,
      },
      { key: "contact-tagline", label: "Contact slide", kind: "line", seed: home.slides.contact.tagline },
    ],
  },
  {
    page: "rowing",
    label: "Rowing",
    paths: ["/rowing"],
    blocks: [
      { key: "introduction", label: "Introduction", kind: "markdown", seed: paragraphs(rowing.introduction) },
      { key: "pb-note", label: "Personal bests: note", kind: "markdown", seed: rowing.personalBestsNote },
      { key: "on-the-water-time", label: "On the water: time", kind: "line", seed: rowing.onTheWater.time },
      { key: "on-the-water-text", label: "On the water: text", kind: "markdown", seed: rowing.onTheWater.text },
      { key: "training-log-intro", label: "Training log: introduction", kind: "markdown", seed: rowing.trainingLogIntro },
    ],
  },
  {
    page: "racing",
    label: "Racing",
    paths: ["/rowing/racing"],
    blocks: [
      { key: "introduction", label: "Introduction", kind: "markdown", seed: rowing.racingIntro },
      { key: "still-to-add", label: "Results: still to add", kind: "markdown", seed: rowing.resultsStillToAdd },
      {
        key: "stories",
        label: "Race stories",
        kind: "markdown",
        seed: paragraphs(rowing.raceStories.map((s) => `**${s.title}** ${s.text}`)),
        help: "One paragraph per story. The bold start of each paragraph becomes the card title.",
      },
    ],
  },
  {
    page: "golf",
    label: "Golf",
    paths: ["/golf"],
    blocks: [
      { key: "introduction", label: "Introduction", kind: "markdown", seed: paragraphs(golf.introduction) },
      { key: "statistics-intro", label: "Statistics: introduction", kind: "markdown", seed: golf.statisticsIntro },
      { key: "holes-in-one", label: "Two holes in one", kind: "markdown", seed: golf.holesInOne },
    ],
  },
  {
    page: "about",
    label: "About",
    paths: ["/about"],
    blocks: [
      { key: "headline", label: "Headline (Latin motto)", kind: "line", seed: about.headline },
      { key: "introduction", label: "Introduction", kind: "markdown", seed: paragraphs(about.introduction) },
      { key: "story", label: "My story", kind: "markdown", seed: paragraphs(about.story) },
      { key: "motto", label: "What I stand for: motto", kind: "line", seed: about.standFor.motto },
      {
        key: "stand-for",
        label: "What I stand for",
        kind: "markdown",
        seed: paragraphs(about.standFor.paragraphs),
      },
      { key: "away-from-sport", label: "Away from sport", kind: "markdown", seed: paragraphs(about.awayFromSport) },
    ],
  },
  {
    page: "training-philosophy",
    label: "Training philosophy",
    paths: ["/about/training-philosophy"],
    blocks: [
      {
        key: "body",
        label: "Text",
        kind: "markdown",
        seed: "",
        help: "Text to follow. The page shows a placeholder while this is empty.",
      },
    ],
  },
  {
    page: "engineering",
    label: "Engineering",
    paths: ["/engineering"],
    blocks: [
      { key: "introduction", label: "Introduction", kind: "markdown", seed: paragraphs(engineering.introduction) },
      { key: "education-note", label: "Education: note", kind: "markdown", seed: engineering.educationNote },
      { key: "project-title", label: "Bachelor project: title", kind: "line", seed: engineering.bachelorProject.title },
      {
        key: "project",
        label: "Bachelor project: text",
        kind: "markdown",
        seed: paragraphs(engineering.bachelorProject.paragraphs),
        help: "Under NDA: only text the project has approved.",
      },
      { key: "future-work", label: "What I'd love to work on", kind: "markdown", seed: leadItems(engineering.futureWork) },
      {
        key: "reports",
        label: "Reports and publications",
        kind: "markdown",
        seed: "",
        help: "Shown only when the Reports and publications toggle is on in Settings.",
      },
    ],
  },
  {
    page: "cv",
    label: "CV",
    paths: ["/cv"],
    blocks: [
      { key: "profile", label: "Profile", kind: "markdown", seed: cv.profile },
      { key: "sport", label: "Sport", kind: "markdown", seed: cv.sport.map((s) => `- ${s}`).join("\n") },
      { key: "skills", label: "Skills", kind: "markdown", seed: cv.skills },
      {
        key: "interests",
        label: "Interests",
        kind: "markdown",
        seed: cv.interests.charAt(0).toUpperCase() + cv.interests.slice(1),
      },
    ],
  },
  {
    page: "contact",
    label: "Contact",
    paths: ["/contact"],
    blocks: [
      { key: "introduction", label: "Introduction", kind: "markdown", seed: contact.contactIntro },
      {
        key: "collaborate",
        label: "Collaborate",
        kind: "markdown",
        seed: paragraphs([
          contact.collaborate.intro,
          leadItems(contact.collaborate.items),
          contact.collaborate.outro,
        ]),
      },
      {
        key: "sponsors",
        label: "Sponsors",
        kind: "markdown",
        seed: "",
        help: "Shown only when the Sponsors toggle is on in Settings.",
      },
    ],
  },
  {
    page: "gallery",
    label: "Gallery",
    paths: ["/gallery"],
    blocks: [{ key: "introduction", label: "Introduction", kind: "markdown", seed: contact.galleryIntro }],
  },
  {
    page: "privacy",
    label: "Privacy",
    paths: ["/privacy"],
    blocks: [
      {
        key: "body",
        label: "Privacy notice",
        kind: "markdown",
        seed: paragraphs([contact.privacy.intro, leadItems(contact.privacy.items)]),
      },
    ],
  },
];

export function getPageBlocks(page: string): PageBlocks {
  const found = pageBlocks.find((p) => p.page === page);
  if (!found) throw new Error(`Unknown text page: ${page}`);
  return found;
}
