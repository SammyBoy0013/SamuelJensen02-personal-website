import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata, PlaceholderNote } from "@/components/PlaceholderPage";
import { CopyAddress } from "@/components/contact/CopyAddress";
import { Markdown } from "@/components/content/Md";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getBlocks, getSettings } from "@/lib/data";

export const generateMetadata = pageMetadata("contact");

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [blocks, settings] = await Promise.all([getBlocks("contact", locale), getSettings()]);
  return <Contact blocks={blocks} email={settings.email} showSponsors={settings.features.sponsors} />;
}

function Contact({
  blocks,
  email,
  showSponsors,
}: {
  blocks: Record<string, string>;
  email: string;
  showSponsors: boolean;
}) {
  const t = useTranslations();
  const c = useTranslations("contact");
  // The subject is fixed by specification 5.10 and translated with the UI.
  const collaborateHref = `mailto:${email}?subject=${encodeURIComponent(c("collaborateSubject"))}`;

  return (
    <>
      <PageHeader title={t("pages.contact.title")} />

      {/* The three buttons from specification 5.10. No forms. */}
      <section id="email" aria-label={c("emailMe")} className="pb-16 nav:pb-24">
        <Reveal className="wrap flex flex-col gap-10">
          <Markdown text={blocks.introduction} />
          <p className="font-serif text-[clamp(28px,4vw,48px)] leading-tight font-semibold break-all text-ink">
            {email}
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <a href={`mailto:${email}`} className="text-link text-ink">
              {c("emailMe")} <span aria-hidden>→</span>
            </a>
            <a href={collaborateHref} className="text-link text-ink">
              {c("collaborate")} <span aria-hidden>→</span>
            </a>
            <CopyAddress
              id="copy-address"
              email={email}
              label={c("copyAddress")}
              copied={c("copied")}
              failed={c("copyFailed", { email: email })}
              className="text-link text-ink"
            />
          </div>
        </Reveal>
      </section>

      <Section id="collaborate" title={c("collaborate")}>
        <Markdown text={blocks.collaborate} />
        <a href={collaborateHref} className="text-link self-start text-ink">
          {c("collaborate")} <span aria-hidden>→</span>
        </a>
      </Section>

      {/* Hidden until a sponsor exists: switched on in admin settings (specification section 2). */}
      {showSponsors && (
        <Section id="sponsors" title={t("pages.contact.sections.sponsors")}>
          {blocks.sponsors?.trim() ? <Markdown text={blocks.sponsors} /> : <PlaceholderNote />}
        </Section>
      )}
    </>
  );
}
