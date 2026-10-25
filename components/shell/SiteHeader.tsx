"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { mainPages, visibleSections, type Features } from "@/lib/site";
import { Monogram } from "@/components/brand/Monogram";
import { Drawer } from "./Drawer";
import { LanguageLinks } from "./LanguageLinks";

/**
 * Navigation from specification 5.1:
 * - "none": home hero just loaded, nothing shown (desktop)
 * - "ribbon": scrolling up, the off-white ribbon is shown
 * - "button": scrolling down, the ribbon hides and the pink circle button shows
 * Below 900 px the ribbon is never shown and the circle button always is.
 */
type Mode = "none" | "ribbon" | "button";

const TOP_THRESHOLD = 8;
const SCROLL_DELTA = 6;

function restingMode(isHome: boolean): Mode {
  return isHome ? "none" : "ribbon";
}

function currentPageKey(pathname: string): string | undefined {
  if (pathname === "/") return "home";
  return mainPages.find((p) => p.href !== "/" && pathname.startsWith(p.href))?.key;
}

export function SiteHeader({ features }: { features: Features }) {
  const t = useTranslations();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const currentPage = currentPageKey(pathname);

  const [mode, setMode] = useState<Mode>(restingMode(isHome));
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const isHomeRef = useRef(isHome);

  // Reset when the route changes: the new page starts at the top, menu closed.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMode(restingMode(isHome));
    setOpen(false);
  }

  useEffect(() => {
    isHomeRef.current = isHome;
  }, [isHome]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y <= TOP_THRESHOLD) {
        setMode(restingMode(isHomeRef.current));
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (Math.abs(delta) < SCROLL_DELTA) return;
      setMode(delta > 0 ? "button" : "ribbon");
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const onMonogramClick = () => {
    setOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const ribbonShown = mode === "ribbon";

  return (
    <>
      <header
        // Keyboard users tabbing into a hidden ribbon bring it back into view.
        onFocusCapture={() => setMode("ribbon")}
        className={`fixed inset-x-0 top-0 z-50 hidden h-[60px] items-center justify-between gap-6 border-b border-line bg-paper/96 px-[var(--gutter)] text-ink transition-transform duration-[350ms] ease-page nav:flex ${
          ribbonShown ? "translate-y-0" : "-translate-y-[110%]"
        }`}
      >
        <Link href="/" onClick={onMonogramClick} aria-label={t("nav.home")} className="flex shrink-0">
          <Monogram />
        </Link>

        <nav aria-label={t("nav.main")}>
          <ul className="flex items-center gap-1">
            {mainPages.map((page) => {
              const isCurrent = currentPage === page.key;
              return (
                // Hover and keyboard focus both open the dropdown. The deeper
                // pink (--pink-deep) keeps the white 13 px labels at AA contrast.
                <li key={page.key} className="group relative">
                  <Link
                    href={page.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`nav-label block border-b-2 px-3 py-2 transition-colors duration-200 hover:bg-pink-deep hover:text-white group-focus-within:bg-pink-deep group-focus-within:text-white ${
                      isCurrent ? "border-pink" : "border-transparent"
                    }`}
                  >
                    {t(`pages.${page.key}.title`)}
                  </Link>
                  {visibleSections(page, features).length > 0 && (
                    <ul
                      aria-label={t("nav.sectionsOf", { page: t(`pages.${page.key}.title`) })}
                      className="invisible absolute top-full left-0 min-w-56 bg-pink-deep p-3 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                    >
                      {visibleSections(page, features).map((s) => (
                        <li key={s.id}>
                          <Link
                            href={s.href ?? `${page.href}#${s.id}`}
                            className="block px-1 py-1.5 text-[14px] whitespace-nowrap text-white underline-offset-4 hover:underline focus-visible:outline-white"
                          >
                            {t(`pages.${page.key}.sections.${s.id}`)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <LanguageLinks tone="ink" />
      </header>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("nav.openMenu")}
        aria-expanded={open}
        className={`fixed top-4 right-4 z-50 flex size-[52px] cursor-pointer items-center justify-center rounded-full bg-pink shadow-[0_4px_16px_rgba(22,19,26,0.25)] transition-[opacity,transform] duration-300 nav:right-[clamp(16px,4vw,48px)] ${
          mode === "button" ? "" : "nav:pointer-events-none nav:scale-75 nav:opacity-0 nav:focus-visible:pointer-events-auto nav:focus-visible:scale-100 nav:focus-visible:opacity-100"
        }`}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <Drawer open={open} onClose={close} currentPage={currentPage} features={features} />
    </>
  );
}
