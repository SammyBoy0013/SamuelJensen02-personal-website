import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("cv");

export default async function Page({ params }: PageProps<"/[locale]/cv">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="cv" />;
}
