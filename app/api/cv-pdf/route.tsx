import { renderToBuffer } from "@react-pdf/renderer";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllSettings, getBlocks, getList, loc } from "@/lib/data";
import { ageFrom } from "@/lib/age";
import { parseBlocks } from "@/components/content/Md";
import { CvDocument, type CvData } from "@/lib/pdf/CvDocument";

// Built on request from the same data as the web CV (specification 5.9).
export const dynamic = "force-dynamic";

/** A Markdown block as plain lines: paragraphs and list items. */
const lines = (text: string | undefined) =>
  parseBlocks(text ?? "").flatMap((b) => (b.type === "p" ? [b.text] : b.items));

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("locale");
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [t, blocks, settings, education, positions, work, languages] = await Promise.all([
    getTranslations({ locale }),
    getBlocks("cv", locale),
    getAllSettings(),
    getList("education", "cv"),
    getList("positions"),
    getList("work"),
    getList("languages"),
  ]);

  const age = ageFrom(settings.dateOfBirth);
  const years = (rows: typeof positions) =>
    rows.map((row) => ({ years: loc(row.years, locale), text: loc(row.text, locale) ?? "" }));

  const data: CvData = {
    labels: {
      name: t("cv.name"),
      profile: t("pages.cv.sections.profile"),
      education: t("pages.cv.sections.education"),
      positions: t("pages.cv.sections.positions"),
      work: t("pages.cv.sections.work"),
      sport: t("pages.cv.sections.sport"),
      skills: t("pages.cv.sections.skills"),
      languages: t("cv.languages"),
      interests: t("cv.interests"),
    },
    // The phone number appears here and nowhere else. Never an address.
    contact: [age !== null ? t("cv.age", { age }) : null, t("cv.based"), settings.phone || null].filter(
      (part): part is string => Boolean(part),
    ),
    email: settings.email,
    profile: lines(blocks.profile).join(" "),
    education: years(education),
    positions: years(positions),
    work: years(work),
    sport: lines(blocks.sport),
    skills: lines(blocks.skills).join(" "),
    languages: languages.length
      ? `${languages.map((l) => `${loc(l.names, locale)} (${loc(l.level, locale)})`).join("; ")}.`
      : "",
    interests: lines(blocks.interests).join(" "),
    // The domain, once it is live; preview addresses are left off.
    footer: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : "",
  };

  const pdf = await renderToBuffer(<CvDocument data={data} />);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Samuel-Jensen-CV.pdf"',
      // Holds the phone number: never stored in a shared cache.
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
