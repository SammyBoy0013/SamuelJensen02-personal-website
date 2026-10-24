import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Reads .env.local, like Next.js does. Migrations use the direct (unpooled) connection.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
