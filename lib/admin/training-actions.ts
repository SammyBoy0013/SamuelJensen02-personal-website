"use server";

// Training log uploads and visibility (specification 5.6). Files are parsed in
// the browser; these actions receive summary figures only and check them with
// zod, which refuses any extra field such as a coordinate.

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth";
import { batchSchema, classify, importSessions } from "@/lib/training/import";
import type { PreviewRow } from "@/lib/training/types";
import type { ActionResult } from "./actions";

function revalidateRowing() {
  for (const locale of routing.locales) revalidatePath(`/${locale}/rowing`);
}

const invalid = { ok: false as const, message: "Some sessions could not be read. Nothing was saved." };

export async function previewTraining(sessions: unknown): Promise<{ ok: true; rows: PreviewRow[] } | { ok: false; message: string }> {
  await requireAdmin();
  const parsed = batchSchema.safeParse(sessions);
  if (!parsed.success) return invalid;
  return { ok: true, rows: await classify(parsed.data) };
}

export async function importTraining(sessions: unknown): Promise<ActionResult & { added?: number; hidden?: number; duplicates?: number }> {
  await requireAdmin();
  const parsed = batchSchema.safeParse(sessions);
  if (!parsed.success) return invalid;
  const result = await importSessions(parsed.data);
  if (result.added > 0) revalidateRowing();
  return { ok: true, message: "Imported.", ...result };
}

export async function setSessionVisible(id: number, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, message: "Unknown session." };
  const updated = await db
    .update(schema.trainingSessions)
    .set({ visible })
    .where(eq(schema.trainingSessions.id, id))
    .returning({ id: schema.trainingSessions.id });
  if (!updated.length) return { ok: false, message: "That session no longer exists. Reload the page." };
  revalidateRowing();
  return { ok: true, message: visible ? "Shown on the site." : "Hidden from the site." };
}

export async function deleteSession(id: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, message: "Unknown session." };
  await db.delete(schema.trainingSessions).where(eq(schema.trainingSessions.id, id));
  revalidateRowing();
  return { ok: true, message: "Session deleted." };
}
