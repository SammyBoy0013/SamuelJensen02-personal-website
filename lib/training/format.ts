// Display formats for training figures, shared by the admin and the Rowing page.

const intlLocale: Record<string, string> = { en: "en-GB", da: "da-DK", fr: "fr-FR" };

/** 3725 as "1:02:05"; 2700 as "45:00". */
export function formatClock(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}

/** Split per 500 m: 108.2 as "1:48.2". */
export function formatSplit(seconds: number | null): string | null {
  if (seconds === null) return null;
  const tenths = Math.round(seconds * 10);
  const m = Math.floor(tenths / 600);
  return `${m}:${((tenths % 600) / 10).toFixed(1).padStart(4, "0")}`;
}

/** 12040 as "12.04 km" (or "12,04 km" in Danish and French). */
export function formatKilometres(metres: number | null, locale = "en"): string | null {
  if (metres === null) return null;
  const km = new Intl.NumberFormat(intlLocale[locale] ?? "en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${km.format(metres / 1000)} km`;
}

/** The session's date and start time in Copenhagen: "20 Oct 2025, 08:01". */
export function formatSessionDate(iso: string, locale = "en"): string {
  return new Intl.DateTimeFormat(intlLocale[locale] ?? "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  }).format(new Date(iso));
}
