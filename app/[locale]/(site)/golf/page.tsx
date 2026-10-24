import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { CountUp } from "@/components/ui/CountUp";
import { StatTiles } from "@/components/ui/StatTiles";
import { GlanceTable, Table } from "@/components/ui/Table";
import { Video } from "@/components/ui/Video";
import { atAGlance, bag, holesInOne, introduction, results, statistics, statisticsIntro } from "@/content/golf";
import { media } from "@/content/media";
import { settings } from "@/content/site";

export const generateMetadata = pageMetadata("golf");

export default async function Page({ params }: PageProps<"/[locale]/golf">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Golf />;
}

function Golf() {
  const t = useTranslations();
  const g = useTranslations("golf");
  const section = (id: string) => t(`pages.golf.sections.${id}`);
  // Statistics without data are hidden (specification 5.7).
  const stats = statistics.filter((s) => s.value !== null);

  return (
    <>
      <PageHeader
        eyebrow={g("eyebrow", { handicap: settings.handicap })}
        title={t("pages.golf.title")}
        photo={media.golfPortrait}
        focus="50% 12%"
      />
      <SectionTabs pageKey="golf" />

      <Section id="introduction" title={section("introduction")}>
        <Prose paragraphs={introduction} />
      </Section>

      <Section id="at-a-glance" title={section("at-a-glance")}>
        <div className="max-w-[860px]">
          <GlanceTable caption={g("glanceCaption")} rows={atAGlance} />
        </div>
      </Section>

      <Section id="results" title={section("results")}>
        <Table
          caption={g("resultsCaption")}
          headers={[g("year"), g("event"), g("result")]}
          rows={results.map((r) => [<Fact key="year" fact={r.year} />, r.event, r.result])}
          placing
        />
      </Section>

      <Section id="statistics" title={section("statistics")}>
        <Prose paragraphs={[statisticsIntro]} />
        {stats.length > 0 && (
          <StatTiles
            tiles={stats.map((s) => ({
              label: g(`stats.${s.key}`),
              value: <CountUp value={s.value as number} decimals={s.decimals} prefix={s.prefix} />,
            }))}
          />
        )}
      </Section>

      <Section id="in-the-bag" title={section("in-the-bag")}>
        <Table
          caption={g("bagCaption")}
          headers={[g("club"), g("makeModel")]}
          rows={bag.map(([club, model]) => [club, model])}
        />
      </Section>

      <Section id="holes-in-one" title={section("holes-in-one")}>
        <Split>
          <Prose paragraphs={[holesInOne]} />
          <Video
            // No poster yet: the fragment shows the first frame instead of black.
            src="/media/golf-hole-out.mp4#t=0.1"
            label={g("videoLabel")}
            className="aspect-[3/4] w-full nav:max-h-[640px]"
          />
        </Split>
      </Section>
    </>
  );
}
