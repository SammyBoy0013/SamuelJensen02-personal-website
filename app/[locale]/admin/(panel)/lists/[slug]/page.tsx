import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { ListEditor } from "@/components/admin/ListEditor";
import { db, schema } from "@/db";
import { listTables } from "@/db/tables";
import { Link } from "@/i18n/navigation";
import { getList } from "@/lib/admin/lists";

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/lists/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const def = getList(slug);
  return { title: def ? `${def.group}: ${def.label}` : "List" };
}

export default async function EditList({ params }: PageProps<"/[locale]/admin/lists/[slug]">) {
  const { slug } = await params;
  const def = getList(slug);
  if (!def) notFound();

  const table = listTables[def.table] as unknown as typeof schema.glanceRows;
  const rows = await db
    .select()
    .from(table)
    .where(def.page ? eq(table.page, def.page) : undefined)
    .orderBy(asc(table.sortOrder), asc(table.id));

  return (
    <>
      <AdminTitle eyebrow={def.group} title={def.label}>
        {def.help && <p>{def.help}</p>}
        <p className="mt-2 text-[14px] text-grey-2">
          Drag the rows, or use the arrows, to change the order. Shown at{" "}
          {def.paths.map((path) => (
            <Link key={path} href={path} className="underline decoration-pink decoration-2 underline-offset-4">
              {path}
            </Link>
          ))}
          .
        </p>
      </AdminTitle>
      <ListEditor def={def} rows={rows} />
    </>
  );
}
