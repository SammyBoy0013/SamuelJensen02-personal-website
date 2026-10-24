import type { Metadata } from "next";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { Link } from "@/i18n/navigation";
import { pageBlocks } from "@/lib/blocks";

export const metadata: Metadata = { title: "Page text" };

export default function PagesIndex() {
  return (
    <>
      <AdminTitle eyebrow="Pages" title="Page text">
        <p>Every text block on the site, page by page, in English, Danish and French.</p>
      </AdminTitle>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 nav:grid-cols-3">
        {pageBlocks.map((p) => (
          <li key={p.page}>
            <Link
              href={`/admin/pages/${p.page}`}
              className="flex flex-col gap-1 rounded border border-line bg-white p-5 transition-colors hover:border-pink"
            >
              <span className="font-serif text-[24px] font-semibold text-ink">{p.label}</span>
              <span className="text-[14px] text-grey-2">
                {p.blocks.length} text {p.blocks.length === 1 ? "block" : "blocks"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
