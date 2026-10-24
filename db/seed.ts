// Loads the phase 2 content into the database: `npm run db:seed`.
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
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
