"use client";

import { useState, useTransition } from "react";
import { saveSettings, type ActionResult } from "@/lib/admin/actions";
import { settingsSchema, type SettingsForm as Values } from "@/lib/admin/validation";
import { attempt, FieldShell, Status, Toggle } from "./fields";

const social = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "strava", label: "Strava" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
] as const;

export function SettingsForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = settingsSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] ??= issue.message;
      setErrors(next);
      setStatus({ ok: false, message: "Please fix the highlighted fields." });
      return;
    }
    setErrors({});
    setStatus(null);
    startTransition(async () => {
      const result = await attempt(() => saveSettings(values));
      setStatus(result);
      if (!result.ok) setErrors(result.errors ?? {});
    });
  };

  const text = (key: "email" | "phone" | "dateOfBirth" | "handicap" | "lowestHandicap" | "heightCm" | "wingspanCm", label: string, help?: string, type = "text") => (
    <FieldShell id={`settings-${key}`} label={label} help={help} error={errors[key]}>
      <input
        id={`settings-${key}`}
        type={type}
        value={(values[key] ?? "") as string}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        className="field"
      />
    </FieldShell>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      <fieldset className="grid grid-cols-1 gap-5 rounded border border-line bg-white p-5 nav:grid-cols-2 nav:p-6">
        <legend className="px-1 font-serif text-[24px] font-semibold text-ink">Contact</legend>
        {text("email", "Email", "Shown on Contact, the CV and in the mailto links.", "email")}
        {text("phone", "Phone (CV PDF only)", "Never shown on the website: it appears only in the downloaded CV PDF.", "tel")}
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-5 rounded border border-line bg-white p-5 nav:grid-cols-2 nav:p-6">
        <legend className="px-1 font-serif text-[24px] font-semibold text-ink">About me</legend>
        {text("dateOfBirth", "Date of birth", "Never shown: the site shows only your age, on the CV page and PDF.", "date")}
        {text("heightCm", "Height (cm)")}
        {text("wingspanCm", "Wingspan (cm)")}
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-5 rounded border border-line bg-white p-5 nav:grid-cols-2 nav:p-6">
        <legend className="px-1 font-serif text-[24px] font-semibold text-ink">Golf</legend>
        {text("handicap", "Handicap", "Such as +1.0. Plus handicaps keep the +.")}
        {text("lowestHandicap", "Lowest handicap")}
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-5 rounded border border-line bg-white p-5 nav:grid-cols-2 nav:p-6">
        <legend className="px-1 font-serif text-[24px] font-semibold text-ink">Social links</legend>
        {social.map((s) => {
          const key = `social.${s.key}`;
          return (
            <FieldShell key={s.key} id={`settings-${s.key}`} label={s.label} error={errors[key]} help="Leave empty to hide the icon.">
              <input
                id={`settings-${s.key}`}
                type="url"
                value={values.social[s.key]}
                onChange={(e) => set("social", { ...values.social, [s.key]: e.target.value })}
                aria-invalid={Boolean(errors[key])}
                className="field"
              />
            </FieldShell>
          );
        })}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded border border-line bg-white p-5 nav:p-6">
        <legend className="px-1 font-serif text-[24px] font-semibold text-ink">Features</legend>
        <Toggle
          label="Sponsors"
          checked={values.features.sponsors}
          onChange={(on) => set("features", { ...values.features, sponsors: on })}
          help="Shows the Sponsors section on Contact. Turn it on once a sponsor exists; its text is under Pages → Contact."
        />
        <Toggle
          label="Reports and publications"
          checked={values.features.reportsAndPublications}
          onChange={(on) => set("features", { ...values.features, reportsAndPublications: on })}
          help="Shows the section on Engineering. Its text is under Pages → Engineering."
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        <Status result={status} />
      </div>
    </form>
  );
}
