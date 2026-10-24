import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBlocks } from "@/lib/data";

export const generateMetadata = pageMetadata("trainingPhilosophy");

export default async function Page({ params }: PageProps<"/[locale]/about/training-philosophy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const blocks = await getBlocks("training-philosophy", locale);
  return <TrainingPhilosophy body={blocks.body} />;
}

// The text is still to be written (specification section 2): a placeholder until it is added in admin.
function TrainingPhilosophy({ body }: { body: string | undefined }) {
  const t = useTranslations();
  if (body?.trim()) {
    return (
      <>
        <PageHeader eyebrow={t("pages.about.title")} title={t("pages.trainingPhilosophy.title")} />
        <section className="wrap pb-24 nav:pb-32">
          <Markdown text={body} />
        </section>
      </>
    );
  }
  return (
    <PlaceholderPage
      pageKey="trainingPhilosophy"
      eyebrow={t("pages.about.title")}
      text={t("placeholder.trainingPhilosophy")}
    />
  );
}
