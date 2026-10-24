import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("rowing");

export default async function Page({ params }: PageProps<"/[locale]/rowing">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="rowing" />;
}
