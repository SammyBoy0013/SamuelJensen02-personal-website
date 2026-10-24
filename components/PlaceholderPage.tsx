import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getPage } from "@/lib/site";

const descriptions = ["about", "rowing", "racing", "golf", "engineering", "cv", "contact"];

/** Metadata for a page: "Page — Samuel Jensen" plus its description, where one is approved. */
export function pageMetadata(pageKey: string) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
      title: t(`pages.${pageKey}.title`),
      ...(descriptions.includes(pageKey) && { description: t(`meta.${pageKey}`) }),
    };
  };
}

export function PlaceholderNote() {
  const t = useTranslations("placeholder");
  return (
    <div className="rounded border-[1.5px] border-dashed border-grey-3 px-6 py-5 text-[15px] text-grey-2">
      <span className="eyebrow mr-3 text-[11px]">{t("label")}</span>
      {t("text")}
    </div>
  );
}

/** Phase 1 stand-in: the page title and one anchored block per section. */
export function PlaceholderPage({ pageKey, comingSoon }: { pageKey: string; comingSoon?: boolean }) {
  const t = useTranslations();
  const page = getPage(pageKey);
  const sections = page.sections.filter((s) => !s.href);

  return (
    <>
      <header className="wrap pt-36 pb-12 nav:pt-44">
        <h1 className="page-title">{t(`pages.${pageKey}.title`)}</h1>
        <div aria-hidden className="mt-8 h-0.5 w-10 bg-pink" />
      </header>

      {comingSoon ? (
        <section className="wrap pb-24">
          <p className="font-serif text-[clamp(28px,3vw,40px)] text-ink italic">{t("comingSoon")}</p>
        </section>
      ) : sections.length === 0 ? (
        <section className="wrap pb-24">
          <PlaceholderNote />
        </section>
      ) : (
        sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="wrap py-16 nav:py-24">
            <h2 id={`${s.id}-title`} className="section-title mb-8">
              {t(`pages.${pageKey}.sections.${s.id}`)}
            </h2>
            <PlaceholderNote />
          </section>
        ))
      )}
    </>
  );
}
