import { getTranslations, setRequestLocale } from "next-intl/server";
import { FallbackNotice } from "@/components/shell/FallbackNotice";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t("skipToContent")}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <FallbackNotice />
    </>
  );
}
