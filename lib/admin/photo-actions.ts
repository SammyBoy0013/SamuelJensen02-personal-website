"use server";

// Gallery and bachelor project photos in Vercel Blob (specification 5.8).
//
// The browser re-encodes each photo before upload, which already drops EXIF
// data; the server re-encodes it again with sharp so no metadata (GPS
// position included) can reach the store, then records the size and the
// dominant colour used as the loading placeholder.

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { eq, inArray, max, sql } from "drizzle-orm";
import sharp from "sharp";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import type { ActionResult } from "./actions";
import { photoCategories, photoSchema } from "./validation";

export type PhotoKind = "gallery" | "project";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

function target(kind: PhotoKind) {
  return kind === "gallery"
    ? { table: schema.galleryItems, paths: ["/gallery"] }
    : { table: schema.projectPhotos, paths: ["/engineering"] };
}

function revalidate(paths: string[]) {
  for (const locale of routing.locales) for (const path of paths) revalidatePath(`/${locale}${path}`);
}

function readFields(form: FormData, kind: PhotoKind) {
  const parsed = photoSchema.safeParse({
    altEn: form.get("altEn") ?? "",
    altDa: form.get("altDa") ?? "",
    altFr: form.get("altFr") ?? "",
    credit: form.get("credit") ?? "",
    category: form.get("category") ?? (kind === "project" ? "project" : ""),
    visible: form.get("visible") === "true",
    approved: form.get("approved") === "true",
  });
  if (parsed.success && !(photoCategories[kind] as readonly string[]).includes(parsed.data.category)) {
    return { success: false as const, errors: { category: "Choose a category." } };
  }
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { success: false as const, errors };
  }
  return { success: true as const, data: parsed.data };
}

export async function uploadPhoto(kind: PhotoKind, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, message: "Vercel Blob is not set up yet (BLOB_READ_WRITE_TOKEN is missing)." };
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a photo first." };
  if (!TYPES.includes(file.type)) return { ok: false, message: "Use a JPEG, PNG or WebP photo." };
  if (file.size > MAX_BYTES) return { ok: false, message: "The photo is too large after resizing (over 4 MB)." };

  const fields = readFields(form, kind);
  if (!fields.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fields.errors };

  // rotate() applies the EXIF orientation; sharp writes no metadata unless asked.
  const image = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
  const { data, info } = await image.jpeg({ quality: 85, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const { dominant } = await sharp(data).stats();
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  const dominantColour = `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`;

  const blob = await put(`${kind}/${randomUUID()}.jpg`, data, { access: "public", contentType: "image/jpeg" });

  const { table, paths } = target(kind);
  const [{ last }] = await db.select({ last: max(table.sortOrder) }).from(table);
  const { approved, ...rest } = fields.data;
  await db.insert(table).values({
    ...rest,
    ...(kind === "project" && { approved }),
    altDa: rest.altDa || null,
    altFr: rest.altFr || null,
    credit: rest.credit || null,
    blobUrl: blob.url,
    width: info.width,
    height: info.height,
    dominantColour,
    sortOrder: (last ?? -1) + 1,
  });
  revalidate(paths);
  return { ok: true, message: "Photo uploaded." };
}

export async function updatePhoto(kind: PhotoKind, id: number, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const fields = readFields(form, kind);
  if (!fields.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fields.errors };
  const { table, paths } = target(kind);
  const { approved, ...rest } = fields.data;
  await db
    .update(table)
    .set({
      ...rest,
      ...(kind === "project" && { approved }),
      altDa: rest.altDa || null,
      altFr: rest.altFr || null,
      credit: rest.credit || null,
    })
    .where(eq(table.id, id));
  revalidate(paths);
  return { ok: true, message: "Saved." };
}

export async function deletePhoto(kind: PhotoKind, id: number): Promise<ActionResult> {
  await requireAdmin();
  const { table, paths } = target(kind);
  const [row] = await db.delete(table).where(eq(table.id, id)).returning({ blobUrl: table.blobUrl });
  if (row && process.env.BLOB_READ_WRITE_TOKEN) await del(row.blobUrl);
  revalidate(paths);
  return { ok: true, message: "Photo deleted." };
}

export async function reorderPhotos(kind: PhotoKind, ids: number[]): Promise<ActionResult> {
  await requireAdmin();
  if (!ids.every(Number.isInteger) || ids.length === 0) return { ok: false, message: "Nothing to reorder." };
  const { table, paths } = target(kind);
  const cases = sql.join(
    ids.map((id, i) => sql`when ${id} then ${i}::integer`),
    sql` `,
  );
  await db
    .update(table)
    .set({ sortOrder: sql`case ${table.id} ${cases} end` })
    .where(inArray(table.id, ids));
  revalidate(paths);
  return { ok: true, message: "Order saved." };
}
