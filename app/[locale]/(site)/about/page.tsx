import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Fact } from "@/components/content/Fact";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Split, SubTitle } from "@/components/layout/Section";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { GlanceTable } from "@/components/ui/Table";
import { Timeline } from "@/components/ui/Timeline";
import { Link } from "@/i18n/navigation";
import { media } from "@/content/media";
import type { Checked } from "@/content/types";
import { fact, getBlocks, getList, getSettings, loc, withSettings } from "@/lib/data";

export const generateMetadata = pageMetadata("about");

export default async function Page({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, timeline, glance, settings] = await Promise.all([
    getBlocks("about", locale),
    getList("timeline"),
    getList("glanceRows", "about"),
    getSettings(),
  ]);
  return (
    <About
      blocks={blocks}
      timeline={timeline.map((item) => ({ year: item.year, text: fact(item, "text", loc(item.text, locale)) }))}
      glance={glance.map((g) => [loc(g.label, locale) ?? "", withSettings(loc(g.value, locale) ?? "", settings)])}
    />
  );
}

function About({
  blocks,
  timeline,
  glance,
}: {
  blocks: Record<string, string>;
  timeline: { year: string; text: Checked }[];
  glance: [string, string][];
}) {
  const t = useTranslations();
  const a = useTranslations("about");
  const section = (id: string) => t(`pages.about.sections.${id}`);

  return (
    <>
      {/* The Culford motto is the headline (phase 2 prompt). */}
      <PageHeader eyebrow={t("pages.about.title")} title={blocks.headline} titleLang="la" photo={media.culfordDinner} focus="50% 20%" whole />
      <SectionTabs pageKey="about" />

      <Section id="introduction" title={section("introduction")}>
        <Markdown text={blocks.introduction} />
      </Section>

      <Section id="my-story" title={section("my-story")}>
        <Markdown text={blocks.story} />
      </Section>

      <Section id="timeline" title={section("timeline")}>
        <Timeline
          label={a("timelineCaption")}
          items={timeline.map((item) => ({ year: item.year, text: <Fact fact={item.text} /> }))}
        />
      </Section>

      <Section id="what-i-stand-for" title={section("what-i-stand-for")}>
        <blockquote lang="la" className="max-w-[24ch] border-l-2 border-pink pl-6 font-serif text-[clamp(28px,3vw,40px)] leading-[1.15] font-medium text-ink italic">
          {blocks.motto}
        </blockquote>
        <Markdown text={blocks["stand-for"]} />
      </Section>

      <Section id="away-from-sport" title={section("away-from-sport")}>
        <Split>
          <Markdown text={blocks["away-from-sport"]} />
          <div className="flex flex-col gap-4">
            <SubTitle>{a("glanceHeading")}</SubTitle>
            <GlanceTable caption={a("glanceCaption")} rows={glance} />
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
