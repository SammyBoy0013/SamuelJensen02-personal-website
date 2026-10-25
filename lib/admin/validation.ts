// zod schemas for the admin forms. The browser runs them for instant feedback;
// the server actions run them again before anything is saved.

import { z } from "zod";
import { formatDuration, formatRaceTime, parseDuration } from "@/lib/format";
import type { Field, ListDef } from "./lists";

export const locales = ["en", "da", "fr"] as const;
export type LocaleCode = (typeof locales)[number];

/** What a form holds: strings for inputs, booleans for toggles. */
export type FormValue = string | boolean | Record<LocaleCode, string> | string[];
export type FormValues = Record<string, FormValue>;

const fail = (ctx: z.RefinementCtx, message: string) => {
  ctx.addIssue({ code: "custom", message });
  return z.NEVER;
};

const text = z.string().trim().max(2000, "Keep this under 2,000 characters.");

function fieldSchema(field: Field): z.ZodType {
  const optional = !field.required;
  switch (field.type) {
    case "text":
      return text.transform((v, ctx) => (v ? v : optional ? null : fail(ctx, "Required.")));
    case "localised":
      return z
        .object({ en: text, da: text.optional(), fr: text.optional() })
        .transform((v, ctx) => {
          if (!v.en) {
            if (v.da || v.fr) return fail(ctx, "Add the English text first: it is the fallback.");
            return optional ? null : fail(ctx, "English is required.");
          }
          return { en: v.en, ...(v.da && { da: v.da }), ...(v.fr && { fr: v.fr }) };
        });
    case "date":
      return z
        .string()
        .trim()
        .transform((v, ctx) => {
          if (!v) return optional ? null : fail(ctx, "Required.");
          const valid = /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
          return valid ? v : fail(ctx, "Use a date such as 2026-10-31.");
        });
    case "int":
    case "real":
      return z
        .string()
        .trim()
        .transform((v, ctx) => {
          if (!v) return optional ? null : fail(ctx, "Required.");
          const n = Number(v.replace(",", ".").replace("−", "-"));
          if (!Number.isFinite(n)) return fail(ctx, "Enter a number.");
          if (field.type === "int" && !Number.isInteger(n)) return fail(ctx, "Enter a whole number.");
          return n;
        });
    case "duration":
    case "raceTime":
      return z
        .string()
        .trim()
        .transform((v, ctx) => {
          if (!v) return optional ? null : fail(ctx, "Required.");
          const ms = parseDuration(v);
          return ms === null ? fail(ctx, "Use minutes and seconds, such as 6:35.8.") : ms;
        });
    case "bool":
      return z.boolean();
    case "crew":
      return z
        .string()
        .transform((v) => v.split(/[,\n]/).map((name) => name.trim()).filter(Boolean))
        .pipe(z.array(z.string().max(100)).max(20, "At most 20 names."));
  }
}

/** The schema for one row of a list: its fields plus the "check" flags. */
export function rowSchema(def: ListDef) {
  const checkable = def.fields.filter((f) => f.checkable).map((f) => f.name);
  return z.object({
    ...Object.fromEntries(def.fields.map((f) => [f.name, fieldSchema(f)])),
    ...(checkable.length > 0 && {
      checkFields: z.array(z.enum(checkable as [string, ...string[]])).default([]),
    }),
  });
}

/** A database row as form values. */
export function toFormValues(def: ListDef, row: Record<string, unknown> | null): FormValues {
  const values: FormValues = {};
  for (const field of def.fields) {
    const value = row?.[field.name];
    switch (field.type) {
      case "localised": {
        const v = (value ?? {}) as Partial<Record<LocaleCode, string>>;
        values[field.name] = { en: v.en ?? "", da: v.da ?? "", fr: v.fr ?? "" };
        break;
      }
      case "bool":
        values[field.name] = row ? Boolean(value) : field.name === "confirmed";
        break;
      case "crew":
        values[field.name] = Array.isArray(value) ? value.join(", ") : "";
        break;
      case "duration":
        values[field.name] = typeof value === "number" ? (formatDuration(value) ?? "").replace(" s", "") : "";
        break;
      case "raceTime":
        values[field.name] = formatRaceTime(value as number | null) ?? "";
        break;
      default:
        values[field.name] = value === null || value === undefined ? "" : String(value);
    }
  }
  if (def.fields.some((f) => f.checkable)) {
    values.checkFields = Array.isArray(row?.checkFields) ? (row.checkFields as string[]) : [];
  }
  return values;
}

/** Field errors keyed by field name, from a failed parse. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

// ---- Text blocks and settings ----

export const blockSchema = z.object({
  page: z.string().min(1),
  key: z.string().min(1),
  locale: z.enum(locales),
  body: z.string().max(20000, "Keep this under 20,000 characters."),
});

const handicap = z
  .string()
  .trim()
  .regex(/^[+-]?\d{1,2}(\.\d)?$/, "Use a handicap such as +1.0 or 4.2.");
const url = z.union([z.literal(""), z.url("Enter a full link starting with https://.")]);
const centimetres = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 && n < 300 ? n : fail(ctx, "Enter whole centimetres, such as 195.");
  });

export const settingsSchema = z.object({
  email: z.email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^$|^\+?[\d\s()-]{6,20}$/, "Use digits, spaces and an optional +, such as +45 12 34 56 78."),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Use a date such as 2002-01-31."),
  handicap,
  lowestHandicap: handicap,
  heightCm: centimetres,
  wingspanCm: centimetres,
  seasonStart: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Use month and day, such as 09-01 for 1 September."),
  social: z.object({ linkedin: url, strava: url, instagram: url, facebook: url }),
  features: z.object({ sponsors: z.boolean(), reportsAndPublications: z.boolean() }),
});

export type SettingsForm = z.input<typeof settingsSchema>;

export const photoCategories = {
  gallery: ["rowing", "golf", "life"],
  project: ["project"],
} as const;

export const photoSchema = z.object({
  altEn: z.string().trim().min(1, "English alt text is required.").max(300),
  altDa: z.string().trim().max(300),
  altFr: z.string().trim().max(300),
  credit: z.string().trim().max(120),
  category: z.enum(["rowing", "golf", "life", "project"]),
  visible: z.boolean(),
  approved: z.boolean(),
});

export type PhotoForm = z.input<typeof photoSchema>;
