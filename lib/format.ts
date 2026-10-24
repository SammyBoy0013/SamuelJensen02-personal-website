const intlLocale: Record<string, string> = { en: "en-GB", da: "da-DK", fr: "fr-FR" };

/** "2025-05-18" as "18 May 2025" (or the Danish or French form). */
export function formatDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(intlLocale[locale] ?? "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Milliseconds as a rowing time: "6:35.8", or "15.0 s" under a minute. */
export function formatDuration(ms: number | null | undefined): string | null {
  if (ms === null || ms === undefined) return null;
  const tenths = Math.round(ms / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = (tenths % 600) / 10;
  if (minutes === 0) return `${seconds.toFixed(1)} s`;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

/** Milliseconds as a race time to hundredths: "7:45.69". */
export function formatRaceTime(ms: number | null | undefined): string | null {
  if (ms === null || ms === undefined) return null;
  const hundredths = Math.round(ms / 10);
  const minutes = Math.floor(hundredths / 6000);
  const seconds = ((hundredths % 6000) / 100).toFixed(2).padStart(5, "0");
  return minutes ? `${minutes}:${seconds}` : seconds;
}

/** "6:35.8", "1:02:03.4", "15.0 s" or "15" to milliseconds; null if unreadable. */
export function parseDuration(text: string): number | null {
  const clean = text.trim().replace(/\s*s$/, "");
  if (!/^\d+(:\d{1,2})*(\.\d+)?$/.test(clean)) return null;
  const seconds = clean.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  return Math.round(seconds * 1000);
}
