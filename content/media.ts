// Photos in public/media with alt text, category and credit. Phase 5 moves the
// gallery into Vercel Blob; phase 3 makes alt text and credits editable.

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

export type Category = "rowing" | "golf" | "life";

export type Photo = {
  id: string;
  src: StaticImageData;
  alt: string;
  category: Category;
  /** Photographer credit; `null` shows "Credit to follow". */
  credit: string | null;
};

const photo = (id: string, src: StaticImageData, alt: string, category: Category): Photo => ({
  id,
  src,
  alt,
  category,
  credit: null,
});

/** Photos used on the pages themselves (docs/02-design-system.md "Image use"). */
export const media = {
  hero: photo("hero-single-sculling", heroSingleSculling, "Samuel sculling the yellow single Balder on calm water", "rowing"),
  crewLift: photo("rowing-crew-lift", rowingCrewLift, "The crew lifting their boat overhead on the jetty", "rowing"),
  startLine: photo("racing-start-line", racingStartLine, "The start line in Zagreb, Balder in lane four", "rowing"),
  sideBySide: photo(
    "racing-side-by-side",
    racingSideBySide,
    "Two scullers racing side by side, the yellow single in the foreground",
    "rowing",
  ),
  golfPortrait: photo("golf-portrait", golfPortrait, "Samuel on the course holding up a golf ball and one finger", "golf"),
  culfordDinner: photo("culford-dinner", culfordDinner, "Samuel in a suit at the Culford School old boys' dinner", "life"),
  teamDock: photo("zagreb-team-dock", zagrebTeamDock, "The Odense team on the jetty in Zagreb, the course behind them", "rowing"),
  carryingTheSingle: photo(
    "carrying-the-single",
    carryingTheSingle,
    "Carrying the single up from the water in Zagreb",
    "rowing",
  ),
};

/** Gallery order: the gallery-* photos first, then the page photos. */
export const gallery: Photo[] = [
  photo("gallery-harbour-racing", harbourRacing, "Two eights racing side by side in Odense harbour, apartment blocks on the quay behind", "rowing"),
  photo("gallery-zagreb-trio", zagrebTrio, "Three rowers in club kit, arms round each other, by the boat racks in Zagreb", "rowing"),
  photo("gallery-under-the-bridge", underTheBridge, "An SDU crew smiling back from their boat as they row towards a bridge under a bright, cloudy sky", "rowing"),
  photo("gallery-boarding", boarding, "A university crew climbing into their boat from the pontoon", "rowing"),
  photo("gallery-medals", medals, "The squad wearing medals on the slipway at dusk", "rowing"),
  photo("gallery-rigging", rigging, "Teammates rigging a yellow single on the grass in Zagreb, one giving a thumbs up", "rowing"),
  photo("gallery-zagreb-backs", zagrebBacks, "Three rowers seen from behind in Odense club and university kit, facing the boat racks in Zagreb", "rowing"),
  photo("gallery-stands", stands, "The team sitting in the grandstand among other crews in Zagreb", "rowing"),
  photo("gallery-tug-of-war", tugOfWar, "Grinning in a red bucket hat while pulling on a tug-of-war rope at a student event", "life"),
  photo("gallery-smile", smile, "Laughing in a red bucket hat and green SIF T-shirt at a student event", "life"),
  photo("gallery-tek-dysten", tekDysten, "Raising a ball and pointing skywards in a green SIF T-shirt at a student sports day", "life"),
  media.hero,
  media.crewLift,
  media.startLine,
  media.sideBySide,
  media.carryingTheSingle,
  media.teamDock,
  media.golfPortrait,
  media.culfordDinner,
];
