import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { CountUp } from "@/components/ui/CountUp";
import { StatTiles } from "@/components/ui/StatTiles";
import { GlanceTable, Table } from "@/components/ui/Table";
import { Video } from "@/components/ui/Video";
import { media } from "@/content/media";
import type { Checked } from "@/content/types";
import { fact, getBlocks, getList, getSettings, loc, withSettings } from "@/lib/data";

export const generateMetadata = pageMetadata("golf");

type Stat = {
  key: "handicap" | "lowestHandicap" | "lowestRound" | "sgPutting" | "dispersion";
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

/** "+1.0" as a count-up value and sign; plus handicaps keep their "+". */
function handicapStat(key: Stat["key"], text: string): Stat | null {
  const value = Number.parseFloat(text.replace("+", ""));
  if (Number.isNaN(value)) return null;
  return { key, value: Math.abs(value), decimals: 1, prefix: text.trim().startsWith("+") ? "+" : value < 0 ? "−" : "" };
}

const average = (values: (number | null)[]) => {
  const known = values.filter((v): v is number => v !== null);
  return known.length ? known.reduce((a, b) => a + b, 0) / known.length : null;
};

export default async function Page({ params }: PageProps<"/[locale]/golf">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, settings, glance, results, rounds, bag] = await Promise.all([
    getBlocks("golf", locale),
    getSettings(),
    getList("glanceRows", "golf"),
    getList("golfResults"),
    getList("golfRounds"),
    getList("golfBag"),
  ]);

  // Summary statistics (specification 5.7): any without data are left out.
  const lowestRound = rounds.length ? Math.min(...rounds.map((r) => r.score)) : null;
  const sgPutting = average(rounds.map((r) => r.sgPutting));
  const dispersion = average(rounds.map((r) => r.dispersionM));
  const stats = [
    handicapStat("handicap", settings.handicap),
    handicapStat("lowestHandicap", settings.lowestHandicap),
    lowestRound !== null && { key: "lowestRound", value: lowestRound },
    sgPutting !== null && {
      key: "sgPutting",
      value: Math.abs(sgPutting),
      decimals: 2,
      prefix: sgPutting >= 0 ? "+" : "−",
    },
    dispersion !== null && { key: "dispersion", value: dispersion, decimals: 1, suffix: " m" },
  ].filter((s): s is Stat => !!s);

  return (
    <Golf
      blocks={blocks}
      handicap={settings.handicap}
      stats={stats}
      glance={glance.map((g) => [loc(g.label, locale) ?? "", withSettings(loc(g.value, locale) ?? "", settings)])}
      results={results.map((r) => ({
        id: r.id,
        year: fact(r, "yearLabel", r.yearLabel ?? r.date?.slice(0, 4)),
        event: [loc(r.event, locale), loc(r.course, locale)].filter(Boolean).join(", "),
        result: loc(r.placing, locale),
      }))}
      bag={bag.map((b) => [loc(b.club, locale), b.makeModel])}
    />
  );
}

function Golf({
  blocks,
  handicap,
  stats,
  glance,
  results,
  bag,
}: {
  blocks: Record<string, string>;
  handicap: string;
  stats: Stat[];
  glance: [string, string][];
  results: { id: number; year: Checked; event: string; result: string | null }[];
  bag: (string | null)[][];
}) {
  const t = useTranslations();
  const g = useTranslations("golf");
  const section = (id: string) => t(`pages.golf.sections.${id}`);

  return (
    <>
      <PageHeader
        eyebrow={g("eyebrow", { handicap })}
        title={t("pages.golf.title")}
        photo={media.golfPortrait}
        focus="50% 12%"
      />
      <SectionTabs pageKey="golf" />

      <Section id="introduction" title={section("introduction")}>
        <Markdown text={blocks.introduction} />
      </Section>

      <Section id="at-a-glance" title={section("at-a-glance")}>
        <div className="max-w-[860px]">
          <GlanceTable caption={g("glanceCaption")} rows={glance} />
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
        <Markdown text={blocks["statistics-intro"]} />
        {stats.length > 0 && (
          <StatTiles
            tiles={stats.map((s) => ({
              label: g(`stats.${s.key}`),
              value: <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />,
            }))}
          />
        )}
      </Section>

      <Section id="in-the-bag" title={section("in-the-bag")}>
        <Table caption={g("bagCaption")} headers={[g("club"), g("makeModel")]} rows={bag} />
      </Section>

      <Section id="holes-in-one" title={section("holes-in-one")}>
        <Split>
          <Markdown text={blocks["holes-in-one"]} />
          <Video
            src="/media/golf-hole-out.mp4"
            poster="/media/posters/golf-hole-out.jpg"
            label={g("videoLabel")}
            className="aspect-[3/4] w-full nav:max-h-[640px]"
          />
        </Split>
      </Section>
    </>
  );
}
