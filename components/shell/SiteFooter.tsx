import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { socialLinks } from "@/lib/site";
import { Seal } from "@/components/brand/Seal";
import { BackToTop } from "./BackToTop";
import { LanguageLinks } from "./LanguageLinks";
import { SocialIcon } from "./SocialIcon";

/** Footer from specification 5.11. Social links come from admin settings, in the fixed order. */
export function SiteFooter({ social }: { social: Record<string, string> }) {
  const t = useTranslations("footer");
  return (
    <footer className="bg-ink text-grey-3">
      <div className="wrap flex flex-col gap-10 py-16 nav:flex-row nav:items-end nav:justify-between">
        <div className="flex flex-col gap-6">
          <Seal className="size-28 text-white" label={t("sealLabel")} />
          <p className="text-[13px]">
            {t("line")} ·{" "}
            <Link href="/privacy" className="underline decoration-pink decoration-2 underline-offset-4 hover:text-paper">
              {t("privacy")}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <ul aria-label={t("social")} className="flex gap-2">
            {socialLinks.filter((s) => social[s.key]).map((s) => (
              <li key={s.key}>
                <a
                  href={social[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-11 items-center justify-center rounded-full border border-grey-4 text-paper transition-colors hover:border-pink hover:text-pink"
                >
                  <SocialIcon network={s.key} />
                </a>
              </li>
            ))}
          </ul>
          <LanguageLinks tone="light" />
          <div className="ml-auto">
            <BackToTop label={t("backToTop")} />
          </div>
        </div>
      </div>
    </footer>
  );
}
