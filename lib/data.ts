// Reads for the public pages. Pages stay static and are revalidated on demand
// when Samuel saves in admin (lib/admin/revalidate.ts).
//
// Without DATABASE_URL (for example a preview whose variables are not set
// yet) everything falls back to the seed content, so the site still builds.

import "server-only";
import { cache } from "react";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db";
import { seedBlocks, seedRows, seedSettings, type SettingsValues } from "@/db/seed-data";
import { listTables, type ListName, type ListRow } from "@/db/tables";
import type { Localised } from "@/db/schema";
import type { Checked } from "@/content/types";
import { ageFrom } from "./age";

/** The text for a locale, falling back to English. */
export function loc(value: Localised | null | undefined, locale: string): string | null {
  if (!value) return null;
  return value[locale as keyof Localised]?.trim() || value.en?.trim() || null;
}

/** A field as a Checked fact: the site tags it while it is still listed in `checkFields`. */
export function fact(
  row: { checkFields?: string[] },
  field: string,
  value: string | null | undefined,
): Checked {
  return { value: value?.trim() ? value : null, check: row.checkFields?.includes(field) };
}

/** Every setting, including the private ones. Never pass the result to a page. */
export const getAllSettings = cache(async (): Promise<SettingsValues> => {
  if (!hasDatabase) return seedSettings;
  const rows = await db.select().from(schema.settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...seedSettings, ...stored } as SettingsValues;
});

export type PublicSettings = Omit<SettingsValues, "phone" | "dateOfBirth"> & { age: number | null };

/**
 * Settings that are safe to show. The phone number (CV PDF only) and the date
 * of birth (age only) are removed here (specification section 4).
 */
export const getSettings = cache(async (): Promise<PublicSettings> => {
  const { phone: _phone, dateOfBirth, ...rest } = await getAllSettings();
  return { ...rest, age: ageFrom(dateOfBirth) };
});

/** Fills {handicap} and {lowestHandicap} in "At a glance" values. */
export function withSettings(text: string, settings: PublicSettings): string {
  return text
    .replaceAll("{handicap}", settings.handicap)
    .replaceAll("{lowestHandicap}", settings.lowestHandicap);
}

/** A page's text blocks by key, in the locale with English as the fallback. */
export const getBlocks = cache(async (page: string, locale: string): Promise<Record<string, string>> => {
  const rows = hasDatabase
    ? await db
        .select()
        .from(schema.contentBlocks)
        .where(and(eq(schema.contentBlocks.page, page), inArray(schema.contentBlocks.locale, ["en", locale])))
    : seedBlocks.filter((b) => b.page === page);
  const blocks: Record<string, string> = {};
  for (const row of rows.filter((r) => r.locale === "en")) blocks[row.key] = row.body;
  for (const row of rows.filter((r) => r.locale === locale && r.body.trim())) blocks[row.key] = row.body;
  return blocks;
});

/** An ordered list table, optionally only the rows for one page. */
export const getList = cache(async <N extends ListName>(name: N, page?: string): Promise<ListRow<N>[]> => {
  if (!hasDatabase) {
    const rows = seedRows[name] as unknown as (ListRow<N> & { page?: string })[];
    return rows.filter((r) => !page || r.page === page);
  }
  // Every list table has `id` and `sort_order`; glance rows and education also have `page`.
  const table = listTables[name] as unknown as typeof schema.glanceRows;
  const hasPage = "page" in listTables[name];
  const rows = await db
    .select()
    .from(table)
    .where(page && hasPage ? eq(table.page, page) : undefined)
    .orderBy(asc(table.sortOrder), asc(table.id));
  return rows as ListRow<N>[];
});

export type PublicPhoto = {
  id: number;
  src: string;
  width: number;
  height: number;
  dominantColour: string;
  alt: string;
  credit: string | null;
  category: string;
};

function toPhoto(row: typeof schema.galleryItems.$inferSelect, locale: string): PublicPhoto {
  const alt = { en: row.altEn, da: row.altDa ?? undefined, fr: row.altFr ?? undefined };
  return {
    id: row.id,
    src: row.blobUrl,
    width: row.width,
    height: row.height,
    dominantColour: row.dominantColour,
    alt: loc(alt, locale) ?? "",
    credit: row.credit,
    category: row.category,
  };
}

/** Visible gallery photos uploaded in admin. */
export const getGalleryPhotos = cache(async (locale: string): Promise<PublicPhoto[]> => {
  if (!hasDatabase) return [];
  const rows = await db
    .select()
    .from(schema.galleryItems)
    .where(eq(schema.galleryItems.visible, true))
    .orderBy(asc(schema.galleryItems.sortOrder), asc(schema.galleryItems.id));
  return rows.map((r) => toPhoto(r, locale));
});

/** Bachelor project photos that are both approved and visible (NDA). */
export const getProjectPhotos = cache(async (locale: string): Promise<PublicPhoto[]> => {
  if (!hasDatabase) return [];
  const rows = await db
    .select()
    .from(schema.projectPhotos)
    .where(and(eq(schema.projectPhotos.visible, true), eq(schema.projectPhotos.approved, true)))
    .orderBy(asc(schema.projectPhotos.sortOrder), asc(schema.projectPhotos.id));
  return rows.map((r) => toPhoto(r, locale));
});
