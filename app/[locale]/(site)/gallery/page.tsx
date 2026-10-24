import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Markdown } from "@/components/content/Md";
import { Gallery, type GalleryPhoto } from "@/components/gallery/Gallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { gallery, type Category } from "@/content/media";
import { getBlocks, getGalleryPhotos } from "@/lib/data";

export const generateMetadata = pageMetadata("gallery");

export default async function Page({ params }: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, uploads] = await Promise.all([getBlocks("gallery", locale), getGalleryPhotos(locale)]);
  // Uploads from admin first, then the photos in public/media (phase 5 moves those into Blob too).
  const photos: GalleryPhoto[] = [
    ...uploads.map((p) => ({ ...p, id: `upload-${p.id}`, category: p.category as Category })),
    ...gallery,
  ];
  return <GalleryPage intro={blocks.introduction} photos={photos} />;
}

function GalleryPage({ intro, photos }: { intro: string | undefined; photos: GalleryPhoto[] }) {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t("pages.gallery.title")} />
      <section aria-label={t("pages.gallery.title")} className="wrap flex flex-col gap-10 pb-24 nav:pb-32">
        <Markdown text={intro} />
        <Gallery photos={photos} />
      </section>
    </>
  );
}
