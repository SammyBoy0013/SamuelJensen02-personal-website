import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { archivo, bodoni } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";
import { Seal } from "@/components/brand/Seal";
import { LoaderGate } from "@/components/shell/LoaderGate";
import { SameSectionLinks } from "@/components/shell/SameSectionLinks";
import "../globals.css";

// Runs before first paint: the loader shows once per browser session.
// It also marks that JavaScript runs, so fade-ups may start hidden.
const loaderScript = `document.documentElement.classList.add("js");try{var s=sessionStorage;if(s.getItem("sj-seen"))document.documentElement.setAttribute("data-seen","");else{s.setItem("sj-seen","1");window.__sjFirstVisit=true}}catch(e){document.documentElement.setAttribute("data-seen","")}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const shareImage = { url: "/og/share-image.jpg", width: 1200, height: 630, alt: t("siteName") };

  return {
    metadataBase: getSiteUrl(),
    title: { default: t("siteName"), template: `%s — ${t("siteName")}` },
    description: t("home"),
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale,
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", images: [shareImage.url] },
    icons: {
      icon: [
        { url: "/brand/favicon.svg", type: "image/svg+xml" },
        { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180" },
    },
  };
}

export const viewport = { themeColor: "#16131A" };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${bodoni.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      </head>
      <body>
        <div className="loader" aria-hidden>
          <Seal />
        </div>
        <LoaderGate />
        <SameSectionLinks />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
