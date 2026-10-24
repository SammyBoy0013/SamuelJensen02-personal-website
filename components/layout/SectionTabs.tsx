import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPage } from "@/lib/site";

/**
 * Sticky section tabs under the page header (design system "Layout"),
 * linking to the page's sections and sub-pages from lib/site.ts.
 */
export function SectionTabs({ pageKey, hide = [] }: { pageKey: string; hide?: string[] }) {
  const t = useTranslations();
  const page = getPage(pageKey);
  const sections = page.sections.filter((s) => !hide.includes(s.id));
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label={t("nav.sectionsOf", { page: t(`pages.${pageKey}.title`) })}
      className="sticky top-0 z-30 border-b border-line bg-paper/96 backdrop-blur-sm"
    >
      {/* Room on the right for the circle menu button on phones. */}
      <ul className="wrap flex gap-7 overflow-x-auto pr-[84px] [scrollbar-width:none] nav:pr-[var(--gutter)]">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <Link
              href={s.href ?? `#${s.id}`}
              className="block border-b-2 border-transparent py-4 text-[14px] whitespace-nowrap text-ink transition-colors hover:border-pink"
            >
              {t(`pages.${pageKey}.sections.${s.id}`)}
              {s.href && <span aria-hidden> →</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
