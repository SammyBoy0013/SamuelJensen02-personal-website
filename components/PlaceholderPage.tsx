import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";

const descriptions = ["home", "about", "rowing", "racing", "golf", "engineering", "cv", "contact"];

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

/** A clearly marked stand-in for content that does not exist yet. */
export function PlaceholderNote({ text }: { text?: string }) {
  const t = useTranslations("placeholder");
  return (
    <div className="rounded border-[1.5px] border-dashed border-grey-3 px-6 py-5 text-[15px] text-grey-2">
      <span className="eyebrow mr-3 text-[11px]">{t("label")}</span>
      {text ?? t("text")}
    </div>
  );
}

/** A page with only a header and a "Coming soon" or placeholder block. */
export function PlaceholderPage({
  pageKey,
  eyebrow,
  comingSoon,
  text,
}: {
  pageKey: string;
  eyebrow?: string;
  comingSoon?: boolean;
  text?: string;
}) {
  const t = useTranslations();

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={t(`pages.${pageKey}.title`)} />
      <section className="wrap pb-24 nav:pb-32">
        {comingSoon ? (
          <div className="pink-grid flex min-h-[320px] items-center justify-center rounded px-6 py-16 text-center">
            <p className="font-serif text-[clamp(40px,5vw,64px)] leading-none font-semibold text-white italic">
              {t("comingSoon")}
            </p>
          </div>
        ) : (
          <PlaceholderNote text={text} />
        )}
      </section>
    </>
  );
}
