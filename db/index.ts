import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** True when a database is configured. Without one, pages fall back to the seed content. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const db = drizzle({
  client: neon(process.env.DATABASE_URL ?? "postgresql://unset@localhost/unset"),
  schema,
  casing: "snake_case",
});

export { schema };
