import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("rowingDashboard");

export default async function Page({ params }: PageProps<"/[locale]/rowing/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="rowingDashboard" comingSoon />;
}
