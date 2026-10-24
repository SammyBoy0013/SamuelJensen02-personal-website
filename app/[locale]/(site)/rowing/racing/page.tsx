import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Md, Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { ExpandableResults } from "@/components/racing/ExpandableResults";
import { Table } from "@/components/ui/Table";
import { media } from "@/content/media";
import { calendar, raceStories, racingIntro, results, resultsStillToAdd } from "@/content/rowing";

export const generateMetadata = pageMetadata("racing");

export default async function Page({ params }: PageProps<"/[locale]/rowing/racing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Racing />;
}

function Racing() {
  const t = useTranslations();
  const r = useTranslations("racing");
  const section = (id: string) => t(`pages.racing.sections.${id}`);
  const confirmed = calendar.filter((c) => c.confirmed);

  return (
    <>
      <PageHeader eyebrow={r("eyebrow")} title={t("pages.racing.title")} photo={media.startLine} focus="50% 50%" />
      <SectionTabs pageKey="racing" />

      <Section id="results" title={section("results")}>
        <Prose paragraphs={[racingIntro]} />
        <Image
          src={media.sideBySide.src}
          alt={media.sideBySide.alt}
          placeholder="blur"
          sizes="(min-width: 1360px) 1200px, 100vw"
          className="aspect-[21/9] w-full rounded object-cover object-[50%_70%]"
        />

        <ExpandableResults
          caption={r("resultsCaption")}
          headers={[r("date"), r("regatta"), r("event"), r("crew"), r("result")]}
          rows={results.map((race) => [
            <Fact key="date" fact={race.date} />,
            race.regatta,
            <Fact key="event" fact={race.event} />,
            <Fact key="crew" fact={race.crew} />,
            <Fact key="result" fact={race.result} />,
          ])}
          limit={10}
          showAll={r("allResults")}
          showFewer={r("fewerResults")}
        />
        <p className="text-[14px] text-grey-2">{resultsStillToAdd}</p>
      </Section>

      <Section id="race-stories" title={section("race-stories")}>
        <div className="grid grid-cols-1 gap-6 nav:grid-cols-2">
          {raceStories.map((story) => (
            <article key={story.title} className="flex flex-col gap-4 rounded border border-line bg-white p-7 nav:p-9">
              <h3 className="font-serif text-[24px] leading-tight font-medium text-ink italic">{story.title}</h3>
              <p className="text-[17px] leading-[1.7]">
                <Md text={story.text} />
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="calendar" title={section("calendar")}>
        {confirmed.length > 0 ? (
          <Table
            caption={r("calendarCaption")}
            headers={[r("date"), r("event"), r("place")]}
            rows={confirmed.map((c) => [c.date, <Fact key="event" fact={c.event} />, c.place])}
          />
        ) : (
          <p>{r("noRaces")}</p>
        )}
      </Section>
    </>
  );
}
