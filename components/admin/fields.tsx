"use client";

import { useId, useState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/admin/actions";
import { locales, type LocaleCode } from "@/lib/admin/validation";

export const localeNames: Record<LocaleCode, string> = { en: "EN", da: "DA", fr: "FR" };

/** Label, help text and error around one input. */
export function FieldShell({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {help && (
        <p id={`${id}-help`} className="text-[13px] text-grey-2">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-pink-text">
          {error}
        </p>
      )}
    </div>
  );
}

/** EN, DA and FR tabs over one text input. English is the fallback for the others. */
export function LocalisedInput({
  id,
  value,
  onChange,
  multiline,
  invalid,
  describedBy,
}: {
  id: string;
  value: Record<LocaleCode, string>;
  onChange: (value: Record<LocaleCode, string>) => void;
  multiline?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [locale, setLocale] = useState<LocaleCode>("en");
  return (
    <div className="flex flex-col gap-1.5">
      <LocaleTabs active={locale} onSelect={setLocale} filled={(l) => Boolean(value[l]?.trim())} controls={id} />
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          lang={locale}
          value={value[locale] ?? ""}
          onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          placeholder={locale === "en" ? "" : value.en ? `Empty: shows the English "${value.en.slice(0, 40)}"` : ""}
          className="field"
        />
      ) : (
        <input
          id={id}
          lang={locale}
          value={value[locale] ?? ""}
          onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          placeholder={locale === "en" ? "" : value.en ? `Empty: shows the English "${value.en.slice(0, 40)}"` : ""}
          className="field"
        />
      )}
    </div>
  );
}

/** Language tabs. A dot marks languages that have text. */
export function LocaleTabs({
  active,
  onSelect,
  filled,
  controls,
}: {
  active: LocaleCode;
  onSelect: (locale: LocaleCode) => void;
  filled: (locale: LocaleCode) => boolean;
  controls?: string;
}) {
  return (
    <div role="group" aria-label="Language" className="flex gap-1">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={active === l}
          aria-controls={controls}
          onClick={() => onSelect(l)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-[12px] font-medium tracking-[0.08em] transition-colors ${
            active === l ? "bg-ink text-white" : "text-grey-2 hover:text-pink-text"
          }`}
        >
          {localeNames[l]}
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${filled(l) ? "bg-pink" : "border border-grey-3"}`}
          />
          <span className="sr-only">{filled(l) ? "(has text)" : "(empty)"}</span>
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  help?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-[var(--pink)]"
        />
        {label}
      </label>
      {help && <p className="pl-7 text-[13px] text-grey-2">{help}</p>}
    </div>
  );
}

/** The short confirmation after a save, read out by screen readers. */
export function Status({ result }: { result: ActionResult | null }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`min-h-[1.5em] text-[14px] font-medium ${result?.ok === false ? "text-pink-text" : "text-grey-1"}`}
    >
      {result && (result.ok ? `✓ ${result.message}` : result.message)}
    </p>
  );
}

/** Runs a server action, turning a network or server failure into a message. */
export async function attempt(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action();
  } catch {
    return { ok: false, message: "That did not save. Check your connection, reload the page and try again." };
  }
}
