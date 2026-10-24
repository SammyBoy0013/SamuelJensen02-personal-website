import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata, PlaceholderNote } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { CountUp } from "@/components/ui/CountUp";
import { StatTiles } from "@/components/ui/StatTiles";
import { Table } from "@/components/ui/Table";
import { Video } from "@/components/ui/Video";
import { media } from "@/content/media";
import {
  goals,
  introduction,
  onTheWater,
  personalBests,
  personalBestsNote,
  trainingLogIntro,
  vitalStatistics,
} from "@/content/rowing";

export const generateMetadata = pageMetadata("rowing");

export default async function Page({ params }: PageProps<"/[locale]/rowing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Rowing />;
}

function Rowing() {
  const t = useTranslations();
  const r = useTranslations("rowing");
  const section = (id: string) => t(`pages.rowing.sections.${id}`);

  return (
    <>
      <PageHeader eyebrow={r("eyebrow")} title={t("pages.rowing.title")} photo={media.crewLift} focus="50% 30%" />
      <SectionTabs pageKey="rowing" />

      <Section id="introduction" title={section("introduction")}>
        <Split>
          <Prose paragraphs={introduction} />
          <Video
            src="/media/carrying-the-single.mp4"
            poster="/media/carrying-the-single.jpg"
            label={r("videoLabel")}
            className="aspect-[3/4] w-full nav:max-h-[640px]"
          />
        </Split>
      </Section>

      <Section id="goals" title={section("goals")}>
        <Table
          caption={r("goalsCaption")}
          headers={[r("when"), r("goal")]}
          rows={goals.map((g) => [g.when, g.goal])}
        />
      </Section>

      <Section id="personal-bests" title={section("personal-bests")}>
        <div className="flex flex-col gap-4">
          <SubTitle>{r("pbHeading")}</SubTitle>
          <Table
            caption={r("pbCaption")}
            headers={[r("distance"), r("time"), r("date")]}
            rows={personalBests.map((pb) => [
              pb.distance,
              <span key="time" className="text-ink">
                {pb.time}
                {pb.watts && <span className="text-grey-2"> ({pb.watts})</span>}
              </span>,
              <Fact key="date" fact={pb.date} />,
            ])}
          />
          <p className="text-[14px] text-grey-2">{personalBestsNote}</p>
        </div>

        <div className="grid grid-cols-1 gap-10 nav:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SubTitle>{r("onTheWater")}</SubTitle>
            <StatTiles tiles={[{ label: r("onTheWaterLabel"), value: onTheWater.time, note: onTheWater.text }]} />
          </div>
          <div className="flex flex-col gap-4">
            <SubTitle>{r("vitalStatistics")}</SubTitle>
            <StatTiles
              compact
              tiles={[
                {
                  label: r("height"),
                  value: <CountUp value={vitalStatistics.height.value} suffix={` ${vitalStatistics.height.unit}`} />,
                },
                {
                  label: r("wingspan"),
                  value: <CountUp value={vitalStatistics.wingspan.value} suffix={` ${vitalStatistics.wingspan.unit}`} />,
                },
                { label: r("weight"), value: r("openWeight") },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section id="training-log" title={section("training-log")}>
        <Prose paragraphs={[trainingLogIntro]} />
        {/* Phase 4 fills these from the uploaded training sessions, with count-up. */}
        <Table
          caption={section("training-log")}
          headers={["", r("sessions"), r("hours"), r("kilometres")]}
          rows={(["thisWeek", "thisMonth", "thisSeason"] as const).map((period) => [r(period), "—", "—", "—"])}
        />
        <PlaceholderNote text={t("placeholder.trainingLog")} />
      </Section>
    </>
  );
}
