import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact, Pending } from "@/components/content/Fact";
import { Markdown, Md, paragraphsOf } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { ExpandableResults } from "@/components/racing/ExpandableResults";
import { Table } from "@/components/ui/Table";
import { media } from "@/content/media";
import type { Checked } from "@/content/types";
import { fact, getBlocks, getList, loc } from "@/lib/data";
import { formatDate, formatRaceTime } from "@/lib/format";

export const generateMetadata = pageMetadata("racing");

type Result = { id: number; date: Checked; regatta: string; event: Checked; crew: Checked; result: Checked; confirmed: boolean };
type Race = { id: number; date: string; name: Checked; place: string | null };

export default async function Page({ params }: PageProps<"/[locale]/rowing/racing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, races, calendar] = await Promise.all([
    getBlocks("racing", locale),
    getList("races"),
    getList("calendarEvents"),
  ]);

  const results: Result[] = races.map((race) => {
    const place = loc(race.place, locale);
    const event = [loc(race.event, locale), race.boatClass].filter(Boolean).join(", ");
    const time = formatRaceTime(race.timeMs);
    const result = [loc(race.placing, locale), loc(race.round, locale), time].filter(Boolean).join(" · ");
    return {
      id: race.id,
      date: fact(race, "dateLabel", formatDate(race.date, locale) ?? race.dateLabel),
      regatta: [loc(race.regatta, locale), place].filter(Boolean).join(", "),
      event: fact(race, "event", event),
      // An empty crew is a single: shown as a dash unless it is still to confirm.
      crew: fact(race, "crew", race.crew.length ? race.crew.join(", ") : race.checkFields.includes("crew") ? null : "—"),
      result: fact(race, "placing", result),
      confirmed: race.confirmed,
    };
  });

  // Only races marked confirmed are shown (specification 5.5).
  const upcoming: Race[] = calendar
    .filter((c) => c.confirmed)
    .map((c) => ({
      id: c.id,
      date: formatDate(c.date, locale) ?? "",
      name: fact(c, "name", loc(c.name, locale)),
      place: loc(c.place, locale),
    }));

  return <Racing blocks={blocks} results={results} upcoming={upcoming} />;
}

function Racing({ blocks, results, upcoming }: { blocks: Record<string, string>; results: Result[]; upcoming: Race[] }) {
  const t = useTranslations();
  const r = useTranslations("racing");
  const pending = useTranslations("pending");
  const section = (id: string) => t(`pages.racing.sections.${id}`);
  // Each story is a paragraph that opens with its title in bold.
  const stories = paragraphsOf(blocks.stories).map((p) => {
    const match = /^\*\*(.+?)\*\*\s*(.*)$/.exec(p);
    return match ? { title: match[1], text: match[2] } : { title: null, text: p };
  });

  return (
    <>
      <PageHeader eyebrow={r("eyebrow")} title={t("pages.racing.title")} photo={media.sideBySide} focus="50% 60%" />
      <SectionTabs pageKey="racing" />

      <Section id="results" title={section("results")}>
        <Markdown text={blocks.introduction} />
        <Image
          src={media.hero.src}
          alt={media.hero.alt}
          placeholder="blur"
          sizes="(min-width: 1360px) 1200px, 100vw"
          className="aspect-[21/9] w-full rounded object-cover object-[50%_40%]"
        />

        <ExpandableResults
          caption={r("resultsCaption")}
          headers={[r("date"), r("regatta"), r("event"), r("crew"), r("result")]}
          rows={results.map((race) => [
            <Fact key="date" fact={race.date} />,
            <span key="regatta">
              {race.regatta}
              {!race.confirmed && (
                <>
                  {" "}
                  <Pending label={pending("check")} />
                </>
              )}
            </span>,
            <Fact key="event" fact={race.event} />,
            <Fact key="crew" fact={race.crew} />,
            <Fact key="result" fact={race.result} />,
          ])}
          limit={10}
          showAll={r("allResults")}
          showFewer={r("fewerResults")}
        />
        {blocks["still-to-add"] && (
          <p className="text-[14px] text-grey-2">
            <Md text={blocks["still-to-add"]} />
          </p>
        )}
      </Section>

      {stories.length > 0 && (
        <Section id="race-stories" title={section("race-stories")}>
          <div className="grid grid-cols-1 gap-6 nav:grid-cols-2">
            {stories.map((story, i) => (
              <article key={i} className="flex flex-col gap-4 rounded border border-line bg-white p-7 nav:p-9">
                {story.title && (
                  <h3 className="font-serif text-[24px] leading-tight font-medium text-ink italic">{story.title}</h3>
                )}
                <p className="text-[17px] leading-[1.7]">
                  <Md text={story.text} />
                </p>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section id="calendar" title={section("calendar")}>
        {upcoming.length > 0 ? (
          <Table
            caption={r("calendarCaption")}
            headers={[r("date"), r("event"), r("place")]}
            rows={upcoming.map((c) => [c.date, <Fact key="event" fact={c.name} />, c.place])}
          />
        ) : (
          <p>{r("noRaces")}</p>
        )}
      </Section>
    </>
  );
}
