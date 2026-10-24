import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("golf");

export default async function Page({ params }: PageProps<"/[locale]/golf">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="golf" />;
}
