import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PlaceholderNote } from "@/components/PlaceholderPage";
import { getPage } from "@/lib/site";
import hero from "@/public/media/hero-single-sculling.jpg";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations();
  const slides = getPage("home").sections.filter((s) => s.id !== "hero");

  return (
    <>
      <section id="hero" aria-labelledby="hero-title" className="relative h-svh min-h-[560px] overflow-hidden bg-ink">
        <Image
          src={hero}
          alt={t("hero.imageAlt")}
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[55%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,19,26,0.5)_0%,rgba(22,19,26,0)_26%,rgba(22,19,26,0)_50%,rgba(22,19,26,0.66)_100%)]"
        />
        <div className="absolute inset-x-[var(--gutter)] bottom-[clamp(36px,8vh,88px)] flex flex-col gap-3.5">
          <p className="eyebrow text-pink-soft">{t("hero.tagline")}</p>
          <h1
            id="hero-title"
            className="text-[clamp(64px,11vw,176px)] leading-[0.88] tracking-[-0.02em] text-white"
          >
            {t("hero.name")}
          </h1>
        </div>
      </section>

      {slides.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="wrap py-16 nav:py-24">
          <h2 id={`${s.id}-title`} className="section-title mb-8">
            {t(`pages.home.sections.${s.id}`)}
          </h2>
          <PlaceholderNote />
        </section>
      ))}
    </>
  );
}
