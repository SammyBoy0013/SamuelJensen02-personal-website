import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("golfDashboard");

export default async function Page({ params }: PageProps<"/[locale]/golf/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlaceholderPage pageKey="golfDashboard" comingSoon />;
}
