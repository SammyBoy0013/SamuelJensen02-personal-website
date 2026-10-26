import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Markdown, Md } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { CountUp } from "@/components/ui/CountUp";
import { StatTiles } from "@/components/ui/StatTiles";
import { Table } from "@/components/ui/Table";
import { Video } from "@/components/ui/Video";
import { SessionList } from "@/components/training/SessionList";
import { TrainingTotals } from "@/components/training/TrainingTotals";
import { media } from "@/content/media";
import { fact, getBlocks, getList, getSettings, loc, type PublicSettings } from "@/lib/data";
import { formatDate, formatDuration } from "@/lib/format";
import { getSessions, getTrainingSummary, type SessionPage, type TrainingSummary } from "@/lib/training/summary";

export const generateMetadata = pageMetadata("rowing");

// Rebuilt hourly so "this week" and "this month" roll over without an upload.
export const revalidate = 3600;

export default async function Page({ params }: PageProps<"/[locale]/rowing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, goals, personalBests, settings, summary, sessions] = await Promise.all([
    getBlocks("rowing", locale),
    getList("goals"),
    getList("personalBests"),
    getSettings(),
    getTrainingSummary(),
    getSessions(),
  ]);
  return (
    <Rowing
      locale={locale}
      blocks={blocks}
      settings={settings}
      summary={summary}
      sessions={sessions}
      goals={goals.map((g) => [loc(g.whenLabel, locale), loc(g.text, locale)])}
      personalBests={personalBests.map((pb) => ({
        id: pb.id,
        metric: loc(pb.metric, locale),
        result: pb.valueMs !== null ? formatDuration(pb.valueMs) : pb.valueM !== null ? `${pb.valueM} m` : null,
        watts: pb.watts,
        date: fact(pb, "date", formatDate(pb.date, locale)),
      }))}
    />
  );
}

function Rowing({
  locale,
  blocks,
  settings,
  summary,
  sessions,
  goals,
  personalBests,
}: {
  locale: string;
  blocks: Record<string, string>;
  settings: PublicSettings;
  summary: TrainingSummary;
  sessions: SessionPage;
  goals: (string | null)[][];
  personalBests: {
    id: number;
    metric: string | null;
    result: string | null;
    watts: number | null;
    date: ReturnType<typeof fact>;
  }[];
}) {
  const t = useTranslations();
  const r = useTranslations("rowing");
  const section = (id: string) => t(`pages.rowing.sections.${id}`);
  const vital = [
    settings.heightCm && { label: r("height"), value: <CountUp value={settings.heightCm} suffix=" cm" /> },
    settings.wingspanCm && { label: r("wingspan"), value: <CountUp value={settings.wingspanCm} suffix=" cm" /> },
    { label: r("weight"), value: r("openWeight") },
  ].filter((tile) => !!tile);

  return (
    <>
      <PageHeader eyebrow={r("eyebrow")} title={t("pages.rowing.title")} photo={media.startLine} focus="58% 45%" />
      <SectionTabs pageKey="rowing" />

      <Section id="introduction" title={section("introduction")}>
        <Split>
          <Markdown text={blocks.introduction} />
          <Video
            src="/media/carrying-the-single.mp4"
            poster="/media/posters/carrying-the-single.webp"
            label={r("videoLabel")}
            className="aspect-[3/4] w-full nav:max-h-[640px]"
          />
        </Split>
      </Section>

      <Section id="goals" title={section("goals")}>
        <Table caption={r("goalsCaption")} headers={[r("when"), r("goal")]} rows={goals} />
      </Section>

      <Section id="personal-bests" title={section("personal-bests")}>
        <div className="flex flex-col gap-4">
          <SubTitle>{r("pbHeading")}</SubTitle>
          <Table
            caption={r("pbCaption")}
            headers={[r("distance"), r("time"), r("date")]}
            rows={personalBests.map((pb) => [
              pb.metric,
              <span key="time" className="text-ink">
                {pb.result}
                {pb.watts !== null && <span className="text-grey-2"> ({pb.watts} W)</span>}
              </span>,
              <Fact key="date" fact={pb.date} />,
            ])}
          />
          {blocks["pb-note"] && (
            <p className="text-[14px] text-grey-2">
              <Md text={blocks["pb-note"]} />
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 nav:grid-cols-2">
          {blocks["on-the-water-time"] && (
            <div className="flex flex-col gap-4">
              <SubTitle>{r("onTheWater")}</SubTitle>
              <StatTiles
                tiles={[
                  {
                    label: r("onTheWaterLabel"),
                    value: blocks["on-the-water-time"],
                    note: blocks["on-the-water-text"] && <Md text={blocks["on-the-water-text"]} />,
                  },
                ]}
              />
            </div>
          )}
          <div className="flex flex-col gap-4">
            <SubTitle>{r("vitalStatistics")}</SubTitle>
            <StatTiles compact tiles={vital} />
          </div>
        </div>
      </Section>

      <Section id="training-log" title={section("training-log")}>
        <Markdown text={blocks["training-log-intro"]} />
        <div className="flex flex-col gap-3">
          <TrainingTotals summary={summary} />
          <p className="text-[14px] text-grey-2">
            {r("training.seasonFrom", { date: formatDate(summary.seasonStart, locale) ?? summary.seasonStart })}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <SubTitle>{r("training.listHeading")}</SubTitle>
          <SessionList initial={sessions} locale={locale} />
        </div>
      </Section>
    </>
  );
}
