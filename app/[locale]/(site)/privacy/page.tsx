import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getBlocks } from "@/lib/data";

export const generateMetadata = pageMetadata("privacy");

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const blocks = await getBlocks("privacy", locale);
  return <Privacy body={blocks.body} />;
}

function Privacy({ body }: { body: string | undefined }) {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t("pages.privacy.title")} />
      <section aria-label={t("pages.privacy.title")} className="pb-24 nav:pb-32">
        <Reveal className="wrap flex flex-col gap-8">
          <Markdown text={body} />
        </Reveal>
      </section>
    </>
  );
}
