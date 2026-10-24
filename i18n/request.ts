import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import en from "../messages/en.json";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

// Danish and French fall back to English for any string not yet translated.
function withFallback(base: Messages, override: Messages): Messages {
  const merged: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] =
      typeof value === "object" && typeof current === "object"
        ? withFallback(current, value)
        : value;
  }
  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages =
    locale === "en"
      ? en
      : withFallback(en, (await import(`../messages/${locale}.json`)).default);

  return { locale, messages };
});
