"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { adminNav } from "@/lib/admin/nav";

function Links() {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-5">
      {adminNav.map((group) => (
        <li key={group.label} className="flex flex-col gap-1.5">
          <p className="field-label">{group.label}</p>
          <ul className="flex flex-col">
            {group.links.map((link) => {
              const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`block border-l-2 py-1 pl-3 text-[15px] transition-colors ${
                      current ? "border-pink font-medium text-ink" : "border-transparent text-grey-1 hover:text-pink-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** The admin sections: a sidebar on wide screens, a fold-out list on phones. */
export function AdminNav() {
  return (
    <>
      <details className="border-b border-line px-[var(--gutter)] py-3 nav:hidden">
        <summary className="nav-label cursor-pointer text-ink">Sections</summary>
        <nav aria-label="Admin sections" className="pt-4 pb-2">
          <Links />
        </nav>
      </details>
      <nav
        aria-label="Admin sections"
        className="sticky top-[57px] hidden max-h-[calc(100svh-57px)] w-[250px] shrink-0 overflow-y-auto border-r border-line py-10 pr-6 pl-[var(--gutter)] nav:block"
      >
        <Links />
      </nav>
    </>
  );
}
