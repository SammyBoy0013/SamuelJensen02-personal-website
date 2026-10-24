import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Order matters: English, Danish, French.
  locales: ["en", "da", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  // The only non-admin cookie: it remembers a language the visitor picked.
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];

// Locales whose text is still English until the phase 6 translations land.
export const fallbackLocales: readonly Locale[] = ["da", "fr"];
