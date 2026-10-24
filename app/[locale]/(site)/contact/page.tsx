import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/components/PlaceholderPage";
import { CopyAddress } from "@/components/contact/CopyAddress";
import { LeadList, Prose } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { collaborate, contactIntro } from "@/content/contact";
import { settings } from "@/content/site";

export const generateMetadata = pageMetadata("contact");

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Contact />;
}

const collaborateHref = `mailto:${settings.email}?subject=${encodeURIComponent(settings.collaborateSubject)}`;

function Contact() {
  const t = useTranslations();
  const c = useTranslations("contact");

  return (
    <>
      <PageHeader title={t("pages.contact.title")} />

      {/* The three buttons from specification 5.10. No forms. */}
      <section id="email" aria-label={c("emailMe")} className="pb-16 nav:pb-24">
        <Reveal className="wrap flex flex-col gap-10">
          <Prose paragraphs={[contactIntro]} />
          <p className="font-serif text-[clamp(28px,4vw,48px)] leading-tight font-semibold break-all text-ink">
            {settings.email}
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <a href={`mailto:${settings.email}`} className="text-link text-ink">
              {c("emailMe")} <span aria-hidden>→</span>
            </a>
            <a href={collaborateHref} className="text-link text-ink">
              {c("collaborate")} <span aria-hidden>→</span>
            </a>
            <CopyAddress
              id="copy-address"
              email={settings.email}
              label={c("copyAddress")}
              copied={c("copied")}
              failed={c("copyFailed", { email: settings.email })}
              className="text-link text-ink"
            />
          </div>
        </Reveal>
      </section>

      <Section id="collaborate" title={c("collaborate")}>
        <Prose paragraphs={[collaborate.intro]} />
        <LeadList items={collaborate.items} />
        <Prose paragraphs={[collaborate.outro]} />
        <a href={collaborateHref} className="text-link self-start text-ink">
          {c("collaborate")} <span aria-hidden>→</span>
        </a>
      </Section>
    </>
  );
}
