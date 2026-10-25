// Loads the phase 2 content into the database: `npm run db:seed`.
//
// The gallery photos in public/media are uploaded to Vercel Blob (when
// BLOB_READ_WRITE_TOKEN is set) and listed in gallery_items, so they can be
// edited, reordered and hidden in admin like any other upload.
//
// Safe to run again: text blocks and settings that already exist are kept,
// and a table that already has rows is skipped, so edits made in admin are
// never overwritten. `npm run db:seed -- --reset` empties the content tables
// first (training sessions and photos are never touched).

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example).");
  const { db, schema } = await import("./index");
  const { seedBlocks, seedRows, seedSettings } = await import("./seed-data");
  const { sql } = await import("drizzle-orm");

  const { listTables: tables } = await import("./tables");

  if (process.argv.includes("--reset")) {
    for (const table of [...Object.values(tables), schema.contentBlocks, schema.settings]) {
      await db.delete(table);
    }
    console.log("Emptied the content tables.");
  }

  const blocks = await db.insert(schema.contentBlocks).values(seedBlocks).onConflictDoNothing().returning();
  console.log(`content_blocks: ${blocks.length} added`);

  const settingRows = Object.entries(seedSettings).map(([key, value]) => ({ key, value }));
  const settings = await db.insert(schema.settings).values(settingRows).onConflictDoNothing().returning();
  console.log(`settings: ${settings.length} added`);

  for (const [name, table] of Object.entries(tables)) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(table);
    if (count > 0) {
      console.log(`${name}: already has ${count} rows, skipped`);
      continue;
    }
    // Let the database assign ids so its sequences stay in step.
    const rows = seedRows[name as keyof typeof seedRows].map(({ id: _id, ...row }) => row);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(table).values(rows as any);
    console.log(`${name}: ${rows.length} added`);
  }

  await seedGallery(db, schema);
}

/**
 * Uploads each gallery photo once, under a fixed name, so running the seed
 * again (or on another branch) reuses the same Blob files.
 */
async function seedGallery(db: typeof import("./index").db, schema: typeof import("./index").schema) {
  const { sql } = await import("drizzle-orm");
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.galleryItems);
  if (count > 0) {
    console.log(`gallery_items: already has ${count} rows, skipped`);
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("gallery_items: skipped (BLOB_READ_WRITE_TOKEN is not set)");
    return;
  }
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const { put } = await import("@vercel/blob");
  const sharp = (await import("sharp")).default;
  const { galleryOrder, photoText } = await import("../content/photo-text");

  const rows = [];
  for (const [i, id] of galleryOrder.entries()) {
    const file = await readFile(path.join(process.cwd(), "public/media", `${id}.jpg`));
    // Same treatment as an admin upload: no metadata kept, at most 2400 px.
    const { data, info } = await sharp(file)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    const { dominant } = await sharp(data).stats();
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    const blob = await put(`gallery/${id}.jpg`, data, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    rows.push({
      blobUrl: blob.url,
      width: info.width,
      height: info.height,
      dominantColour: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
      altEn: photoText[id].alt,
      credit: null,
      category: photoText[id].category,
      sortOrder: i,
      visible: true,
    });
  }
  await db.insert(schema.galleryItems).values(rows);
  console.log(`gallery_items: ${rows.length} uploaded to Blob and added`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
