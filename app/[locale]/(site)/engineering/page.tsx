import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("engineering");

export default async function Page({ params }: PageProps<"/[locale]/engineering">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="engineering" />;
}
