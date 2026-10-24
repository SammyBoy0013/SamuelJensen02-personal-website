import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { LeadList, Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { Table } from "@/components/ui/Table";
import { bachelorProject, education, educationNote, futureWork, introduction, skills } from "@/content/engineering";

export const generateMetadata = pageMetadata("engineering");

export default async function Page({ params }: PageProps<"/[locale]/engineering">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Engineering />;
}

function Engineering() {
  const t = useTranslations();
  const e = useTranslations("engineering");
  const section = (id: string) => t(`pages.engineering.sections.${id}`);

  return (
    <>
      {/* No approved project photos yet: the pink grid stands in (design system "Image use"). */}
      <PageHeader eyebrow={e("eyebrow")} title={t("pages.engineering.title")} grid />
      <SectionTabs pageKey="engineering" />

      <Section id="introduction" title={section("introduction")}>
        <Prose paragraphs={introduction} />
      </Section>

      <Section id="education" title={section("education")}>
        <Table
          caption={e("educationCaption")}
          headers={[e("years"), e("qualification")]}
          rows={education.map((row) => [<Fact key="years" fact={row.years} />, row.qualification])}
        />
        <p className="text-[17px]">{educationNote}</p>
      </Section>

      <Section id="bachelor-project" title={section("bachelor-project")}>
        <Split>
          <div className="flex flex-col gap-5">
            <SubTitle>{bachelorProject.title}</SubTitle>
            <Prose paragraphs={bachelorProject.paragraphs} />
          </div>
          {/* Placeholder until Samuel approves project photos in admin (NDA). */}
          <div className="pink-grid flex aspect-[4/3] items-center justify-center rounded p-8">
            <p className="max-w-[280px] rounded border-[1.5px] border-dashed border-grey-3 px-6 py-5 text-center text-[14px] leading-[1.6] text-paper">
              {t("placeholder.projectPhoto")}
            </p>
          </div>
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
        <LeadList items={futureWork} />
      </Section>

      {/* Reports and publications stays hidden (feature flag, specification section 2). */}
    </>
  );
}
