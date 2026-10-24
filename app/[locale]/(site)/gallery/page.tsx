import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Gallery } from "@/components/gallery/Gallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { galleryIntro } from "@/content/contact";
import { gallery } from "@/content/media";

export const generateMetadata = pageMetadata("gallery");

export default async function Page({ params }: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GalleryPage />;
}

function GalleryPage() {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t("pages.gallery.title")} />
      <section aria-label={t("pages.gallery.title")} className="wrap flex flex-col gap-10 pb-24 nav:pb-32">
        <p className="max-w-[68ch] text-[18px] leading-[1.7]">{galleryIntro}</p>
        <Gallery photos={gallery} />
      </section>
    </>
  );
}
