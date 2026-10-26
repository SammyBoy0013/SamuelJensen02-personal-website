import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { HomeSnap } from "@/components/home/HomeSnap";
import { Parallax } from "@/components/home/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { media, type Photo } from "@/content/media";
import { getBlocks, getSettings, type PublicSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("home");

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, settings] = await Promise.all([getBlocks("home", locale), getSettings()]);
  return <Home blocks={blocks} settings={settings} />;
}

// Person structured data (specification 5.12). Only facts already public on the site.
function personJsonLd(settings: PublicSettings) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Samuel Gustav Jensen",
    alternateName: "Samuel Jensen",
    url: new URL("/en", url).href,
    image: new URL(media.hero.src.src, url).href,
    email: `mailto:${settings.email}`,
    description: "Samuel Jensen: engineer, rower and golfer. MSc student at SDU, racing the single for Odense Roklub.",
    homeLocation: { "@type": "Place", name: "Odense, Denmark" },
    affiliation: { "@type": "CollegeOrUniversity", name: "University of Southern Denmark" },
    memberOf: { "@type": "SportsOrganization", name: "Odense Roklub" },
    alumniOf: { "@type": "School", name: "Culford School" },
    knowsLanguage: ["en", "da", "fr"],
    sameAs: Object.values(settings.social).filter(Boolean),
  };
}

function Home({ blocks, settings }: { blocks: Record<string, string>; settings: PublicSettings }) {
  const t = useTranslations("home");
  const pages = useTranslations("pages");
  const enter = (page: string) => t("enter", { page: page.toLowerCase() });

  return (
    <>
      <HomeSnap />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(settings)).replace(/</g, "\\u003c") }}
      />

      {/* 1. Hero: name and photo only; the ribbon stays hidden until scrolling up. */}
      <section id="hero" aria-labelledby="hero-title" className="slide relative h-svh min-h-[560px] overflow-hidden bg-ink">
        <SlidePhoto photo={media.hero} focus="55% 40%" priority />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,19,26,0.5)_0%,rgba(22,19,26,0)_26%,rgba(22,19,26,0)_50%,rgba(22,19,26,0.66)_100%)]"
        />
        <Reveal onLoad className="absolute inset-x-[var(--gutter)] bottom-[clamp(36px,8vh,88px)] flex flex-col gap-3.5">
          <p className="eyebrow text-pink-soft">{blocks["hero-tagline"]}</p>
          <h1 id="hero-title" className="text-[clamp(64px,11vw,176px)] leading-[0.88] tracking-[-0.02em] text-white">
            {blocks["hero-title"]}
          </h1>
        </Reveal>
      </section>

      {/* 2. Rowing: full-bleed photo, text bottom left. */}
      <section id="rowing" aria-labelledby="rowing-title" className="slide relative h-svh min-h-[560px] overflow-hidden bg-ink">
        <SlidePhoto photo={media.crewLift} focus="50% 35%" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(22,19,26,0.8)_0%,rgba(22,19,26,0.15)_60%),linear-gradient(90deg,rgba(22,19,26,0.55)_0%,rgba(22,19,26,0)_60%)]"
        />
        <SlideText number="01" id="rowing" href="/rowing" title={pages("rowing.title")} tagline={blocks["rowing-tagline"]} enter={enter(pages("rowing.title"))} dark className="absolute inset-x-[var(--gutter)] bottom-[clamp(40px,10vh,110px)]" />
      </section>

      {/* 3. Golf: text beside the portrait. */}
      <section id="golf" aria-labelledby="golf-title" className="slide flex h-svh min-h-[560px] flex-col-reverse overflow-hidden bg-paper nav:flex-row">
        <div className="flex flex-1 items-center px-[var(--gutter)] py-10 nav:px-[clamp(32px,6vw,96px)]">
          <SlideText number="02" id="golf" href="/golf" title={pages("golf.title")} tagline={blocks["golf-tagline"]} enter={enter(pages("golf.title"))} />
        </div>
        <div className="relative min-h-0 flex-1 bg-ink">
          <SlidePhoto photo={media.golfPortrait} focus="50% 25%" sizes="(min-width: 900px) 50vw, 100vw" />
        </div>
      </section>

      {/* 4. About: full-bleed team photo. */}
      <section id="about" aria-labelledby="about-title" className="slide relative h-svh min-h-[560px] overflow-hidden bg-ink">
        <SlidePhoto photo={media.teamDock} focus="50% 45%" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(22,19,26,0.8)_0%,rgba(22,19,26,0.1)_60%)]" />
        <SlideText number="03" id="about" href="/about" title={pages("about.title")} tagline={blocks["about-tagline"]} enter={enter(pages("about.title"))} dark className="absolute inset-x-[var(--gutter)] bottom-[clamp(40px,10vh,110px)]" />
      </section>

      {/* 5. Engineering: the pink grid stands in for project photos until they are approved. */}
      <section id="engineering" aria-labelledby="engineering-title" className="slide flex h-svh min-h-[560px] flex-col overflow-hidden bg-paper nav:flex-row">
        <div aria-hidden className="pink-grid min-h-0 flex-1" />
        <div className="flex flex-1 items-center px-[var(--gutter)] py-10 nav:px-[clamp(32px,6vw,96px)]">
          <SlideText number="04" id="engineering" href="/engineering" title={pages("engineering.title")} tagline={blocks["engineering-tagline"]} enter={enter(pages("engineering.title"))} />
        </div>
      </section>

      {/* 6. Contact */}
      <section id="contact" aria-labelledby="contact-title" className="slide flex h-svh min-h-[560px] items-center overflow-hidden bg-ink">
        <SlideText number="05" id="contact" href="/contact" title={pages("contact.title")} tagline={blocks["contact-tagline"]} enter={enter(pages("contact.title"))} dark className="wrap" />
      </section>
    </>
  );
}

function SlidePhoto({
  photo,
  focus,
  priority,
  sizes = "100vw",
}: {
  photo: Photo;
  focus: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    // Chrome does not count an image that fills the whole screen as the page's
    // largest paint (it treats it as a background), so the hero photo stops
    // 1 px short of the slide's ink edge. Unseen, but measurable for LCP.
    <Parallax className={priority ? "inset-x-0 top-0 bottom-px" : undefined}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        placeholder="blur"
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: focus }}
      />
    </Parallax>
  );
}

function SlideText({
  number,
  id,
  href,
  title,
  tagline,
  enter,
  dark,
  className = "",
}: {
  number: string;
  id: string;
  href: "/rowing" | "/golf" | "/about" | "/engineering" | "/contact";
  title: string;
  tagline: ReactNode;
  enter: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`flex max-w-[560px] flex-col items-start gap-4 ${className}`}>
      <p aria-hidden className={`eyebrow ${dark ? "text-pink-soft" : ""}`}>
        {number}
      </p>
      <h2
        id={`${id}-title`}
        className={`text-[clamp(52px,6vw,96px)] leading-[0.92] ${dark ? "text-white" : ""}`}
      >
        <Link href={href} className="transition-colors hover:text-pink">
          {title}
        </Link>
      </h2>
      <p className={`text-[18px] leading-[1.6] ${dark ? "text-paper" : "text-grey-1"}`}>{tagline}</p>
      {/* Same destination as the title, so it is skipped by keyboard and screen readers. */}
      <Link href={href} tabIndex={-1} aria-hidden className={`text-link ${dark ? "text-white" : "text-ink"}`}>
        {enter} <span>→</span>
      </Link>
    </Reveal>
  );
}
