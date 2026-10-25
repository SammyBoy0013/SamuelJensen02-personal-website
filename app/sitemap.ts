import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/metadata";
import { mainPages, subPages } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Every public page in English, Danish and French, each with hreflang
 * alternates for the other two (specification 5.12). Admin is left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const url = (locale: string, path: string) => new URL(localePath(locale, path), base).href;
  const paths = [...mainPages, ...subPages].map((p) => p.href);

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      changeFrequency: path === "/rowing" || path === "/rowing/racing" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
          "x-default": url(routing.defaultLocale, path),
        },
      },
    })),
  );
}
