import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { LeadList, Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { privacy } from "@/content/contact";

export const generateMetadata = pageMetadata("privacy");

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Privacy />;
}

function Privacy() {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t("pages.privacy.title")} />
      <section aria-label={t("pages.privacy.title")} className="pb-24 nav:pb-32">
        <Reveal className="wrap flex flex-col gap-8">
          <Prose paragraphs={[privacy.intro]} />
          <LeadList items={privacy.items} />
        </Reveal>
      </section>
    </>
  );
}
