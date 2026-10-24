import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("golfDashboard");

export default async function Page({ params }: PageProps<"/[locale]/golf/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Dashboard />;
}

// Designed separately later (specification section 2).
function Dashboard() {
  const t = useTranslations();
  return <PlaceholderPage pageKey="golfDashboard" eyebrow={t("pages.golf.title")} comingSoon />;
}
