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
import type { Checked } from "@/content/types";
import { fact, getBlocks, getList, getProjectPhotos, getSettings, loc, type PublicPhoto } from "@/lib/data";

export const generateMetadata = pageMetadata("engineering");

export default async function Page({ params }: PageProps<"/[locale]/engineering">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, education, skills, photos, settings] = await Promise.all([
    getBlocks("engineering", locale),
    getList("education", "engineering"),
    getList("skills"),
    getProjectPhotos(locale),
    getSettings(),
  ]);
  return (
    <Engineering
      blocks={blocks}
      photos={photos}
      showReports={settings.features.reportsAndPublications}
      education={education.map((row) => ({
        id: row.id,
        years: fact(row, "years", loc(row.years, locale)),
        text: loc(row.text, locale),
      }))}
      skills={skills.map((row) => ({
        id: row.id,
        area: loc(row.area, locale),
        skills: fact(row, "skills", loc(row.skills, locale)),
      }))}
    />
  );
}

function Engineering({
  blocks,
  photos,
  showReports,
  education,
  skills,
}: {
  blocks: Record<string, string>;
  photos: PublicPhoto[];
  showReports: boolean;
  education: { id: number; years: Checked; text: string | null }[];
  skills: { id: number; area: string | null; skills: Checked }[];
}) {
  const t = useTranslations();
  const e = useTranslations("engineering");
  const section = (id: string) => t(`pages.engineering.sections.${id}`);

  return (
    <>
      {/* No approved project photos yet: the pink grid stands in (design system "Image use"). */}
      <PageHeader eyebrow={e("eyebrow")} title={t("pages.engineering.title")} grid />
      <SectionTabs pageKey="engineering" features={{ reportsAndPublications: showReports }} />

      <Section id="introduction" title={section("introduction")}>
        <Markdown text={blocks.introduction} />
      </Section>

      <Section id="education" title={section("education")}>
        <Table
          caption={e("educationCaption")}
          headers={[e("years"), e("qualification")]}
          rows={education.map((row) => [<Fact key="years" fact={row.years} />, row.text])}
        />
        <Markdown text={blocks["education-note"]} small />
      </Section>

      <Section id="bachelor-project" title={section("bachelor-project")}>
        <Split>
          <div className="flex flex-col gap-5">
            {blocks["project-title"] && <SubTitle>{blocks["project-title"]}</SubTitle>}
            <Markdown text={blocks.project} />
          </div>
          {photos.length > 0 ? (
            // Only photos approved in admin appear (NDA, specification section 4).
            <div className="grid grid-cols-1 gap-4">
              {photos.map((photo) => (
                <figure key={photo.id} className="flex flex-col gap-2">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 900px) 560px, 100vw"
                    className="h-auto w-full rounded"
                    style={{ backgroundColor: photo.dominantColour }}
                  />
                  {photo.credit && (
                    <figcaption className="text-[13px] text-grey-2">{t("gallery.credit", { credit: photo.credit })}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <div className="pink-grid flex aspect-[4/3] items-center justify-center rounded p-8">
              <p className="max-w-[280px] rounded border-[1.5px] border-dashed border-grey-3 px-6 py-5 text-center text-[14px] leading-[1.6] text-paper">
                {t("placeholder.projectPhoto")}
              </p>
            </div>
          )}
        </Split>
      </Section>

      <Section id="skills" title={section("skills")}>
        <Table
          caption={e("skillsCaption")}
          headers={[e("area"), e("skills")]}
          rows={skills.map((row) => [row.area, <Fact key="skills" fact={row.skills} />])}
        />
      </Section>

      <Section id="future-work" title={section("future-work")}>
        <Markdown text={blocks["future-work"]} />
      </Section>

      {/* Hidden unless switched on in admin settings (specification section 2). */}
      {showReports && (
        <Section id="reports" title={section("reports")}>
          {blocks.reports?.trim() ? <Markdown text={blocks.reports} /> : <PlaceholderNote />}
        </Section>
      )}
    </>
  );
}
