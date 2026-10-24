import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { db, schema } from "@/db";
import { Link } from "@/i18n/navigation";
import { pageBlocks } from "@/lib/blocks";
import { locales, type LocaleCode } from "@/lib/admin/validation";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/pages/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: pageBlocks.find((p) => p.page === page)?.label ?? "Page text" };
}

export default async function EditPage({ params }: PageProps<"/[locale]/admin/pages/[page]">) {
  const { page } = await params;
  const def = pageBlocks.find((p) => p.page === page);
  if (!def) notFound();

  const rows = await db.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.page, page));
  const texts = (key: string) =>
    Object.fromEntries(
      locales.map((l) => [l, rows.find((r) => r.key === key && r.locale === l)?.body ?? ""]),
    ) as Record<LocaleCode, string>;

  return (
    <>
      <AdminTitle eyebrow="Page text" title={def.label}>
        <p>
          Shown at{" "}
          {def.paths.map((path) => (
            <Link key={path} href={path} className="underline decoration-pink decoration-2 underline-offset-4">
              {path}
            </Link>
          ))}
          . Save each language separately.
        </p>
      </AdminTitle>
      {def.blocks.map(({ seed: _seed, ...block }) => (
        <BlockEditor key={block.key} page={page} block={block} initial={texts(block.key)} />
      ))}
    </>
  );
}
