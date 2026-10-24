"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mainPages } from "@/lib/site";
import { LanguageLinks } from "./LanguageLinks";

type Props = {
  open: boolean;
  onClose: () => void;
  currentPage: string | undefined;
};

/** Slide-in menu from the right (specification 5.1). Esc and the scrim close it. */
export function Drawer({ open, onClose, currentPage }: Props) {
  const t = useTranslations();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the drawer while it is open.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-ink/45 transition-opacity duration-[350ms] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(420px,100%)] flex-col gap-7 overflow-y-auto border-l-[3px] border-pink bg-ink px-10 pt-6 pb-10 transition-transform duration-[450ms] ease-drawer ${
          open ? "translate-x-0" : "translate-x-[105%]"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("nav.closeMenu")}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center self-end rounded-full border border-grey-4 text-paper transition-colors hover:border-pink"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <nav aria-label={t("nav.menu")}>
          <ul className="flex flex-col gap-5">
            {mainPages.map((page) => (
              <li key={page.key}>
                <Link
                  href={page.href}
                  onClick={onClose}
                  aria-current={currentPage === page.key ? "page" : undefined}
                  className={`font-serif text-[34px] leading-[1.15] transition-colors hover:text-pink ${
                    currentPage === page.key ? "text-pink" : "text-paper"
                  }`}
                >
                  {t(`pages.${page.key}.title`)}
                </Link>
                {page.sections.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 pl-1">
                    {page.sections.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={s.href ?? `${page.href}#${s.id}`}
                          onClick={onClose}
                          className="text-[13px] text-grey-3 transition-colors hover:text-paper"
                        >
                          {t(`pages.${page.key}.sections.${s.id}`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <LanguageLinks tone="light" className="mt-auto gap-4" onNavigate={onClose} />
      </div>
    </>
  );
}
