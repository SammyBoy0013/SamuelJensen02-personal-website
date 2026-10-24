"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fallbackLocales, type Locale } from "@/i18n/routing";

/** Small notice on Danish and French routes until their text exists (phase 6). */
export function FallbackNotice() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [dismissed, setDismissed] = useState(false);
  if (!fallbackLocales.includes(locale) || dismissed) return null;

  return (
    <div
      role="status"
      lang="en"
      className="fixed bottom-4 left-4 z-40 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded bg-ink/92 py-2 pr-2 pl-4 text-[13px] leading-snug text-paper shadow-lg sm:max-w-md"
    >
      <span>{t(`fallback.${locale}`)}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("fallback.dismiss")}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-grey-3 hover:text-paper"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </div>
  );
}
