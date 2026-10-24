// Builds the PNG and ICO favicon fallbacks from public/brand/favicon.svg.
// Run with `npm run icons` after changing the favicon.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = readFileSync("public/brand/favicon.svg");
const render = (size) => sharp(svg, { density: 72 * (size / 64) * 2 }).resize(size, size);

await render(32).png().toFile("public/brand/favicon-32.png");
await render(192).png().toFile("public/brand/icon-192.png");
await render(512).png().toFile("public/brand/icon-512.png");
// iOS fills transparent corners with black, so give the touch icon an ink background.
await render(180).flatten({ background: "#16131A" }).png().toFile("public/brand/apple-touch-icon.png");

const ico = await pngToIco([
  await render(16).png().toBuffer(),
  await render(32).png().toBuffer(),
  await render(48).png().toBuffer(),
]);
writeFileSync("public/favicon.ico", ico);
console.log("Wrote favicon PNGs and public/favicon.ico");
