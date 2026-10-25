import { Archivo, Bodoni_Moda } from "next/font/google";

// Self-hosted at build time by next/font: visitors never contact Google.
//
// Only the Latin subset: it covers English, Danish and French, plus the dashes
// and minus sign the text uses. Only the body font is preloaded; Bodoni loads
// as soon as the stylesheet asks for it (its italic only on pages that use it),
// so fonts do not compete with the header photo on slow connections.
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
  preload: false,
});

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
