import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { GlanceTable } from "@/components/ui/Table";
import { Timeline } from "@/components/ui/Timeline";
import { Link } from "@/i18n/navigation";
import { atAGlance, awayFromSport, headline, introduction, standFor, story, timeline } from "@/content/about";
import { media } from "@/content/media";

export const generateMetadata = pageMetadata("about");

export default async function Page({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <About />;
}

function About() {
  const t = useTranslations();
  const a = useTranslations("about");
  const section = (id: string) => t(`pages.about.sections.${id}`);

  return (
    <>
      {/* The Culford motto is the headline (phase 2 prompt). */}
      <PageHeader eyebrow={t("pages.about.title")} title={headline} titleLang="la" photo={media.culfordDinner} focus="50% 30%" />
      <SectionTabs pageKey="about" />

      <Section id="introduction" title={section("introduction")}>
        <Prose paragraphs={introduction} />
      </Section>

      <Section id="my-story" title={section("my-story")}>
        <Prose paragraphs={story} />
      </Section>

      <Section id="timeline" title={section("timeline")}>
        <Timeline
          label={a("timelineCaption")}
          items={timeline.map((item) => ({ year: item.year, text: <Fact fact={item.text} /> }))}
        />
      </Section>

      <Section id="what-i-stand-for" title={section("what-i-stand-for")}>
        <blockquote lang="la" className="max-w-[24ch] border-l-2 border-pink pl-6 font-serif text-[clamp(28px,3vw,40px)] leading-[1.15] font-medium text-ink italic">
          {standFor.motto}
        </blockquote>
        <Prose paragraphs={standFor.paragraphs} />
      </Section>

      <Section id="away-from-sport" title={section("away-from-sport")}>
        <Split>
          <Prose paragraphs={awayFromSport} />
          <div className="flex flex-col gap-4">
            <SubTitle>{a("glanceHeading")}</SubTitle>
            <GlanceTable caption={a("glanceCaption")} rows={atAGlance} />
          </div>
        </Split>
      </Section>

      <section id="training-philosophy" aria-label={section("training-philosophy")} className="border-t border-line">
        <div className="wrap py-16 nav:py-24">
          <Link
            href="/about/training-philosophy"
            className="group relative flex min-h-[220px] items-end overflow-hidden rounded bg-ink p-8 nav:p-12"
          >
            <Image
              src={media.teamDock.src}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1360px) 1200px, 100vw"
              className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="relative font-serif text-[clamp(32px,4vw,52px)] leading-none font-semibold text-white">
              {section("training-philosophy")} <span aria-hidden className="text-pink">→</span>
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
