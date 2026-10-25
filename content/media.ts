// Photos in public/media, used by the pages themselves. The gallery is served
// from Vercel Blob (uploaded by `npm run db:seed`, then edited in admin); the
// `gallery` list here is only its fallback when no database is configured.

import type { StaticImageData } from "next/image";
import boarding from "@/public/media/gallery-boarding.jpg";
import harbourRacing from "@/public/media/gallery-harbour-racing.jpg";
import medals from "@/public/media/gallery-medals.jpg";
import rigging from "@/public/media/gallery-rigging.jpg";
import smile from "@/public/media/gallery-smile.jpg";
import stands from "@/public/media/gallery-stands.jpg";
import tekDysten from "@/public/media/gallery-tek-dysten.jpg";
import tugOfWar from "@/public/media/gallery-tug-of-war.jpg";
import underTheBridge from "@/public/media/gallery-under-the-bridge.jpg";
import zagrebBacks from "@/public/media/gallery-zagreb-backs.jpg";
import zagrebTrio from "@/public/media/gallery-zagreb-trio.jpg";
import carryingTheSingle from "@/public/media/carrying-the-single.jpg";
import culfordDinner from "@/public/media/culford-dinner.jpg";
import golfPortrait from "@/public/media/golf-portrait.jpg";
import heroSingleSculling from "@/public/media/hero-single-sculling.jpg";
import racingSideBySide from "@/public/media/racing-side-by-side.jpg";
import racingStartLine from "@/public/media/racing-start-line.jpg";
import rowingCrewLift from "@/public/media/rowing-crew-lift.jpg";
import zagrebTeamDock from "@/public/media/zagreb-team-dock.jpg";

import { photoText, type Category } from "./photo-text";

export type { Category };

export type Photo = {
  id: string;
  src: StaticImageData;
  alt: string;
  category: Category;
  /** Photographer credit; `null` shows "Credit to follow". */
  credit: string | null;
};

const photo = (id: string, src: StaticImageData): Photo => ({
  id,
  src,
  alt: photoText[id].alt,
  category: photoText[id].category,
  credit: null,
});

/** Photos used on the pages themselves (docs/02-design-system.md "Image use"). */
export const media = {
  hero: photo("hero-single-sculling", heroSingleSculling),
  crewLift: photo("rowing-crew-lift", rowingCrewLift),
  startLine: photo("racing-start-line", racingStartLine),
  sideBySide: photo("racing-side-by-side", racingSideBySide),
  golfPortrait: photo("golf-portrait", golfPortrait),
  culfordDinner: photo("culford-dinner", culfordDinner),
  teamDock: photo("zagreb-team-dock", zagrebTeamDock),
  carryingTheSingle: photo("carrying-the-single", carryingTheSingle),
};

/** Gallery order: the gallery-* photos first, then the page photos. */
export const gallery: Photo[] = [
  photo("gallery-harbour-racing", harbourRacing),
  photo("gallery-zagreb-trio", zagrebTrio),
  photo("gallery-under-the-bridge", underTheBridge),
  photo("gallery-boarding", boarding),
  photo("gallery-medals", medals),
  photo("gallery-rigging", rigging),
  photo("gallery-zagreb-backs", zagrebBacks),
  photo("gallery-stands", stands),
  photo("gallery-tug-of-war", tugOfWar),
  photo("gallery-smile", smile),
  photo("gallery-tek-dysten", tekDysten),
  media.hero,
  media.crewLift,
  media.startLine,
  media.sideBySide,
  media.carryingTheSingle,
  media.teamDock,
  media.golfPortrait,
  media.culfordDinner,
];
