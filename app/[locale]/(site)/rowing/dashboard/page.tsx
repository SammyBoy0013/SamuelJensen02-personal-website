import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage, pageMetadata } from "@/components/PlaceholderPage";

export const generateMetadata = pageMetadata("rowingDashboard");

export default async function Page({ params }: PageProps<"/[locale]/rowing/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Dashboard />;
}

// Designed separately later (specification section 2).
function Dashboard() {
  const t = useTranslations();
  return <PlaceholderPage pageKey="rowingDashboard" eyebrow={t("pages.rowing.title")} comingSoon />;
}
