import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("trainingPhilosophy");

export default async function Page({ params }: PageProps<"/[locale]/about/training-philosophy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrainingPhilosophy />;
}

// The text is still to be written (specification section 2).
function TrainingPhilosophy() {
  const t = useTranslations();
  return (
    <PlaceholderPage
      pageKey="trainingPhilosophy"
      eyebrow={t("pages.about.title")}
      text={t("placeholder.trainingPhilosophy")}
    />
  );
}
