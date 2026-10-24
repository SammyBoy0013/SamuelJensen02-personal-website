"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  /** Colours for the current and other languages. */
  tone: "ink" | "light";
  className?: string;
  onNavigate?: () => void;
};

/** EN · DA · FR, linking to the same page in each language. */
export function LanguageLinks({ tone, className = "", onNavigate }: Props) {
  const t = useTranslations("languages");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <ul aria-label={tNav("language")} className={`flex gap-3 ${className}`}>
      {routing.locales.map((l) => {
        const current = l === locale;
        return (
          <li key={l}>
            <Link
              href={pathname}
              locale={l}
              lang={l}
              hrefLang={l}
              aria-label={t(l)}
              aria-current={current ? "true" : undefined}
              onClick={onNavigate}
              className={[
                "nav-label inline-block border-b-2 py-1 tracking-[0.1em] transition-colors",
                current ? "border-pink" : "border-transparent",
                tone === "ink"
                  ? current
                    ? "text-ink"
                    : "text-grey-2 hover:text-ink"
                  : current
                    ? "text-paper"
                    : "text-grey-3 hover:text-paper",
              ].join(" ")}
            >
              {l.toUpperCase()}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
