// Alt text and category for every photo in public/media. Plain data, so the
// seed script (which cannot import image files) and content/media.ts share it.

export type Category = "rowing" | "golf" | "life";

export const photoText: Record<string, { alt: string; category: Category }> = {
  "hero-single-sculling": { alt: "Samuel sculling the yellow single Balder on calm water", category: "rowing" },
  "rowing-crew-lift": { alt: "The crew lifting their boat overhead on the jetty", category: "rowing" },
  "racing-start-line": { alt: "The start line in Zagreb, Balder in lane four", category: "rowing" },
  "racing-side-by-side": { alt: "Two scullers racing side by side, the yellow single in the foreground", category: "rowing" },
  "golf-portrait": { alt: "Samuel on the course holding up a golf ball and one finger", category: "golf" },
  "culford-dinner": { alt: "Samuel in a suit at the Fifth Dinner Club reunion at Culford", category: "life" },
  "zagreb-team-dock": { alt: "The Odense team on the jetty in Zagreb, the course behind them", category: "rowing" },
  "carrying-the-single": { alt: "Carrying the single up from the water in Zagreb", category: "rowing" },
  "gallery-harbour-racing": { alt: "Two eights racing side by side in Odense harbour, apartment blocks on the quay behind", category: "rowing" },
  "gallery-zagreb-trio": { alt: "Three rowers in club kit, arms round each other, by the boat racks in Zagreb", category: "rowing" },
  "gallery-under-the-bridge": { alt: "An SDU crew smiling back from their boat as they row towards a bridge under a bright, cloudy sky", category: "rowing" },
  "gallery-boarding": { alt: "A university crew climbing into their boat from the pontoon", category: "rowing" },
  "gallery-medals": { alt: "The squad wearing medals on the slipway at dusk", category: "rowing" },
  "gallery-rigging": { alt: "Teammates rigging a yellow single on the grass in Zagreb, one giving a thumbs up", category: "rowing" },
  "gallery-zagreb-backs": { alt: "Three rowers seen from behind in Odense club and university kit, facing the boat racks in Zagreb", category: "rowing" },
  "gallery-stands": { alt: "The team sitting in the grandstand among other crews in Zagreb", category: "rowing" },
  "gallery-tug-of-war": { alt: "Grinning in a red bucket hat while pulling on a tug-of-war rope at a student event", category: "life" },
  "gallery-smile": { alt: "Laughing in a red bucket hat and green SIF T-shirt at a student event", category: "life" },
  "gallery-tek-dysten": { alt: "Raising a ball and pointing skywards in a green SIF T-shirt at a student sports day", category: "life" },
};

/** Gallery order: the gallery-* photos first, then the page photos. */
export const galleryOrder = [
  "gallery-harbour-racing",
  "gallery-zagreb-trio",
  "gallery-under-the-bridge",
  "gallery-boarding",
  "gallery-medals",
  "gallery-rigging",
  "gallery-zagreb-backs",
  "gallery-stands",
  "gallery-tug-of-war",
  "gallery-smile",
  "gallery-tek-dysten",
  "hero-single-sculling",
  "rowing-crew-lift",
  "racing-start-line",
  "racing-side-by-side",
  "carrying-the-single",
  "zagreb-team-dock",
  "golf-portrait",
  "culford-dinner",
];
