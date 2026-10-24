import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata, PlaceholderNote } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { Table } from "@/components/ui/Table";
import { media } from "@/content/media";
import type { Checked } from "@/content/types";
import { fact, getBlocks, getList, getSettings, loc } from "@/lib/data";

export const generateMetadata = pageMetadata("cv");

// Rebuild daily so the age stays right after a birthday.
export const revalidate = 86400;

type YearsRow = { id: number; years: Checked; text: string | null };

export default async function Page({ params }: PageProps<"/[locale]/cv">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, settings, education, positions, work, languages] = await Promise.all([
    getBlocks("cv", locale),
    getSettings(),
    getList("education", "cv"),
    getList("positions"),
    getList("work"),
    getList("languages"),
  ]);
  const years = (rows: typeof positions): YearsRow[] =>
    rows.map((row) => ({ id: row.id, years: fact(row, "years", loc(row.years, locale)), text: loc(row.text, locale) }));

  return (
    <Cv
      locale={locale}
      blocks={blocks}
      age={settings.age}
      email={settings.email}
      education={years(education)}
      positions={years(positions)}
      work={years(work)}
      // "English, Danish and French (native); German, Swedish and Norwegian (basic)."
      languages={
        languages.length
          ? `${languages.map((l) => `${loc(l.names, locale)} (${loc(l.level, locale)})`).join("; ")}.`
          : ""
      }
    />
  );
}

// No phone number and no address on the web CV (specification section 4).
function Cv({
  locale,
  blocks,
  age,
  email,
  education,
  positions,
  work,
  languages,
}: {
  locale: string;
  blocks: Record<string, string>;
  age: number | null;
  email: string;
  education: YearsRow[];
  positions: YearsRow[];
  work: YearsRow[];
  languages: string;
}) {
  const t = useTranslations();
  const c = useTranslations("cv");
  const section = (id: string) => t(`pages.cv.sections.${id}`);
  const yearsTable = (caption: string, header: string, rows: YearsRow[]) => (
    <Table
      caption={caption}
      headers={[c("years"), header]}
      rows={rows.map((row) => [<Fact key="years" fact={row.years} />, row.text])}
    />
  );

  return (
    <>
      <PageHeader title={t("pages.cv.title")} />
      <SectionTabs pageKey="cv" />

      <Section id="profile" title={section("profile")}>
        <Split>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-[15px]">
              <p className="font-serif text-[28px] leading-tight font-semibold text-ink">{c("name")}</p>
              <p className="text-grey-2">
                {age !== null ? c("age", { age }) : null}
                {age !== null && " · "}
                {c("based")} ·{" "}
                <a href={`mailto:${email}`} className="underline decoration-pink decoration-2 underline-offset-4 hover:text-pink-text">
                  {email}
                </a>
              </p>
            </div>
            {age === null && <PlaceholderNote text={t("placeholder.age")} />}
            <Markdown text={blocks.profile} />
            {/* The PDF adds the phone number; the web page never shows it. */}
            <a href={`/api/cv-pdf?locale=${locale}`} download className="text-link self-start text-ink">
              {c("download")} <span aria-hidden>↓</span>
            </a>
          </div>
          <Image
            src={media.culfordDinner.src}
            alt={media.culfordDinner.alt}
            placeholder="blur"
            sizes="(min-width: 900px) 480px, 100vw"
            className="aspect-[4/5] w-full rounded object-cover object-[50%_30%]"
          />
        </Split>
      </Section>

      <Section id="education" title={section("education")}>
        {yearsTable(c("educationCaption"), c("qualification"), education)}
      </Section>

      <Section id="positions" title={section("positions")}>
        {yearsTable(c("positionsCaption"), c("role"), positions)}
      </Section>

      <Section id="work" title={section("work")}>
        {yearsTable(c("workCaption"), c("role"), work)}
      </Section>

      <Section id="sport" title={section("sport")}>
        <Markdown text={blocks.sport} />
      </Section>

      <Section id="skills" title={section("skills")}>
        <div className="grid grid-cols-1 gap-8 nav:grid-cols-3">
          {[
            { label: section("skills"), text: blocks.skills },
            { label: c("languages"), text: languages },
            { label: c("interests"), text: blocks.interests },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <SubTitle>{item.label}</SubTitle>
              <Markdown text={item.text} small />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
