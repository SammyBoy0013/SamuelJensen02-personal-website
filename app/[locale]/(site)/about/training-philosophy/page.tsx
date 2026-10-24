import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("trainingPhilosophy");

export default async function Page({ params }: PageProps<"/[locale]/about/training-philosophy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="trainingPhilosophy" />;
}
