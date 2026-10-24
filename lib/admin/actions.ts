"use server";

// Every admin save. Each action checks the admin first (anyone else gets a
// 404), validates with zod, writes, then revalidates the affected public pages
// in all three languages and returns a short message for the form.

import { revalidatePath } from "next/cache";
import { and, eq, inArray, max, min, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { listTables } from "@/db/tables";
import { getPageBlocks } from "@/lib/blocks";
import { requireAdmin } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { getList } from "./lists";
import { blockSchema, fieldErrors, rowSchema, settingsSchema, type FormValues } from "./validation";

export type ActionResult = { ok: true; message: string; id?: number } | { ok: false; message: string; errors?: Record<string, string> };

/** Revalidates public routes such as "/rowing" in every language. */
function revalidate(paths: string[]) {
  for (const locale of routing.locales) {
    for (const path of paths) revalidatePath(path === "/" ? `/${locale}` : `/${locale}${path}`);
  }
}

function listTable(slug: string) {
  const def = getList(slug);
  if (!def) throw new Error(`Unknown list: ${slug}`);
  // Every list table has `id` and `sort_order`; some also have `page`.
  const table = listTables[def.table] as unknown as typeof schema.glanceRows;
  const scope = def.page ? eq(table.page, def.page) : undefined;
  return { def, table, scope };
}

export async function saveListRow(slug: string, id: number | null, values: FormValues): Promise<ActionResult> {
  await requireAdmin();
  const { def, table, scope } = listTable(slug);
  const parsed = rowSchema(def).safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }
  const data = { ...parsed.data, ...(def.page && { page: def.page }) } as typeof table.$inferInsert;

  if (id === null) {
    // New rows go to the top (newest first) or the bottom of the list.
    const [edge] = await db
      .select({ first: min(table.sortOrder), last: max(table.sortOrder) })
      .from(table)
      .where(scope);
    const sortOrder = def.addAt === "start" ? (edge.first ?? 0) - 1 : (edge.last ?? -1) + 1;
    const [row] = await db
      .insert(table)
      .values({ ...data, sortOrder })
      .returning({ id: table.id });
    revalidate(def.paths);
    return { ok: true, message: "Added.", id: row.id };
  }

  const updated = await db
    .update(table)
    .set(data)
    .where(and(eq(table.id, id), scope))
    .returning({ id: table.id });
  if (updated.length === 0) return { ok: false, message: "That row no longer exists. Reload the page." };
  revalidate(def.paths);
  return { ok: true, message: "Saved." };
}

export async function deleteListRow(slug: string, id: number): Promise<ActionResult> {
  await requireAdmin();
  const { def, table, scope } = listTable(slug);
  await db.delete(table).where(and(eq(table.id, id), scope));
  revalidate(def.paths);
  return { ok: true, message: "Deleted." };
}

/** Saves a new order: `ids` from top to bottom. */
export async function reorderList(slug: string, ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  const { def, table, scope } = listTable(slug);
  if (!ids.every(Number.isInteger) || ids.length === 0) return { ok: false, message: "Nothing to reorder." };
  // One statement, so the order never ends up half-saved.
  const cases = sql.join(
    ids.map((id, i) => sql`when ${id} then ${i}::integer`),
    sql` `,
  );
  await db
    .update(table)
    .set({ sortOrder: sql`case ${table.id} ${cases} end` })
    .where(and(inArray(table.id, ids), scope));
  revalidate(def.paths);
  return { ok: true, message: "Order saved." };
}

export async function saveBlock(input: { page: string; key: string; locale: string; body: string }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { page, key, locale, body } = parsed.data;
  const pageDef = getPageBlocks(page);
  if (!pageDef.blocks.some((b) => b.key === key)) return { ok: false, message: "Unknown text block." };

  await db
    .insert(schema.contentBlocks)
    .values({ page, key, locale, body })
    .onConflictDoUpdate({
      target: [schema.contentBlocks.page, schema.contentBlocks.key, schema.contentBlocks.locale],
      set: { body, updatedAt: new Date() },
    });
  revalidate(pageDef.paths);
  return { ok: true, message: "Saved. The page is updated." };
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    // Nested fields (social.strava) are reported under their full path.
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value }));
  for (const row of rows) {
    await db
      .insert(schema.settings)
      .values(row)
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: row.value, updatedAt: new Date() } });
  }
  // Settings appear site-wide (email, handicap, footer links, toggles).
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved. Every page is updated." };
}
