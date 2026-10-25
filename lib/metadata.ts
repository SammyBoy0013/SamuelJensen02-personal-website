// Page metadata (specification 5.12): "Page — Samuel Jensen", the approved
// description, a canonical URL with hreflang alternates for EN, DA and FR, and
// Open Graph and Twitter tags with the share image on every page.

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPage } from "@/lib/site";

/** Pages with an approved meta description in docs/04-page-text-en.md. */
const descriptions = ["home", "about", "rowing", "racing", "golf", "engineering", "cv", "contact"];

const ogLocale: Record<string, string> = { en: "en_GB", da: "da_DK", fr: "fr_FR" };

export const shareImage = { url: "/og/share-image.jpg", width: 1200, height: 630, type: "image/jpeg" };

/** "/rowing" in a locale: "/en/rowing" (and "/en" for the home page). */
export function localePath(locale: string, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Canonical URL and hreflang alternates for a route, relative to metadataBase. */
export function alternatesFor(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(routing.defaultLocale, path),
    },
  };
}

export function pageMetadata(pageKey: string) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    const siteName = t("meta.siteName");
    const path = getPage(pageKey).href;
    const title = pageKey === "home" ? siteName : `${t(`pages.${pageKey}.title`)} — ${siteName}`;
    const description = descriptions.includes(pageKey) ? t(`meta.${pageKey}`) : undefined;
    const image = { ...shareImage, alt: siteName };

    return {
      title: pageKey === "home" ? { absolute: siteName } : t(`pages.${pageKey}.title`),
      description,
      alternates: alternatesFor(locale, path),
      openGraph: {
        type: pageKey === "home" ? "profile" : "website",
        siteName,
        title,
        description,
        url: localePath(locale, path),
        locale: ogLocale[locale],
        alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
        images: [image],
      },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  };
}
