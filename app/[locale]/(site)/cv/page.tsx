import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata, PlaceholderNote } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Md, Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { Table } from "@/components/ui/Table";
import { education, interests, languages, positions, profile, skills, sport, work } from "@/content/cv";
import { media } from "@/content/media";
import { settings } from "@/content/site";
import type { Checked } from "@/content/types";
import { getAge } from "@/lib/age";

export const generateMetadata = pageMetadata("cv");

// Rebuild daily so the age stays right after a birthday.
export const revalidate = 86400;

export default async function Page({ params }: PageProps<"/[locale]/cv">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Cv age={getAge()} />;
}

// No phone number and no address on the web CV (specification section 4).
function Cv({ age }: { age: number | null }) {
  const t = useTranslations();
  const c = useTranslations("cv");
  const section = (id: string) => t(`pages.cv.sections.${id}`);
  const yearsTable = (caption: string, header: string, rows: { years: Checked; text: string }[]) => (
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
                <a href={`mailto:${settings.email}`} className="underline decoration-pink decoration-2 underline-offset-4 hover:text-pink-text">
                  {settings.email}
                </a>
              </p>
            </div>
            {age === null && <PlaceholderNote text={t("placeholder.age")} />}
            <Prose paragraphs={[profile]} />
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
        <ul className="flex max-w-[68ch] flex-col gap-3 text-[18px] leading-[1.7]">
          {sport.map((line) => (
            <li key={line} className="relative pl-6">
              <span aria-hidden className="absolute top-[0.8em] left-0 h-0.5 w-3 bg-pink" />
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="skills" title={section("skills")}>
        <div className="grid grid-cols-1 gap-8 nav:grid-cols-3">
          {[
            { label: section("skills"), text: skills },
            { label: c("languages"), text: languages },
            { label: c("interests"), text: interests },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <SubTitle>{item.label}</SubTitle>
              <p className="text-[17px] leading-[1.7]">
                <Md text={item.text.charAt(0).toUpperCase() + item.text.slice(1)} />
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
